#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, Map, String, Symbol, Vec,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyVoted = 2,
    InvalidOption = 3,
    AlreadyInitialized = 4,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Question,
    Options,
    Votes,     // Map<u32, u32>
    Voters,    // Map<Address, bool>
    Admin,
}

#[contract]
pub struct LivePollContract;

#[contractimpl]
impl LivePollContract {
    pub fn initialize(env: Env, admin: Address, question: String, options: Vec<String>) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Question) {
            return Err(Error::AlreadyInitialized);
        }
        
        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Question, &question);
        env.storage().instance().set(&DataKey::Options, &options);

        let mut votes: Map<u32, u32> = Map::new(&env);
        for i in 0..options.len() {
            votes.set(i, 0);
        }
        env.storage().instance().set(&DataKey::Votes, &votes);
        env.storage().instance().set(&DataKey::Voters, &Map::<Address, bool>::new(&env));

        Ok(())
    }

    pub fn vote(env: Env, voter: Address, option_index: u32) -> Result<(), Error> {
        voter.require_auth();

        if !env.storage().instance().has(&DataKey::Question) {
            return Err(Error::NotInitialized);
        }

        let mut voters: Map<Address, bool> = env.storage().instance().get(&DataKey::Voters).unwrap();
        if voters.contains_key(voter.clone()) {
            return Err(Error::AlreadyVoted);
        }

        let options: Vec<String> = env.storage().instance().get(&DataKey::Options).unwrap();
        if option_index >= options.len() {
            return Err(Error::InvalidOption);
        }

        let mut votes: Map<u32, u32> = env.storage().instance().get(&DataKey::Votes).unwrap();
        let current_votes = votes.get(option_index).unwrap_or(0);
        votes.set(option_index, current_votes + 1);

        voters.set(voter.clone(), true);

        env.storage().instance().set(&DataKey::Votes, &votes);
        env.storage().instance().set(&DataKey::Voters, &voters);

        // Emit Event
        env.events().publish(
            (symbol_short!("vote"), voter),
            option_index,
        );

        Ok(())
    }

    pub fn get_results(env: Env) -> Map<u32, u32> {
        env.storage().instance().get(&DataKey::Votes).unwrap_or(Map::new(&env))
    }

    pub fn get_question(env: Env) -> String {
        env.storage().instance().get(&DataKey::Question).unwrap()
    }

    pub fn get_options(env: Env) -> Vec<String> {
        env.storage().instance().get(&DataKey::Options).unwrap()
    }

    pub fn has_voted(env: Env, address: Address) -> bool {
        let voters: Map<Address, bool> = env.storage().instance().get(&DataKey::Voters).unwrap_or(Map::new(&env));
        voters.contains_key(address)
    }
}

mod test;
