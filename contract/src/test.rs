#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::{Address as _, Events}, Env, String, Vec};

#[test]
fn test_poll_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, LivePollContract);
    let client = LivePollContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let question = String::from_str(&env, "What is your favorite color?");
    let options = Vec::from_array(&env, [
        String::from_str(&env, "Red"),
        String::from_str(&env, "Blue"),
        String::from_str(&env, "Green"),
    ]);

    client.initialize(&admin, &question, &options);

    assert_eq!(client.get_question(), question);
    assert_eq!(client.get_options().len(), 3);

    let voter1 = Address::generate(&env);
    client.vote(&voter1, &1);

    let results = client.get_results();
    assert_eq!(results.get(1).unwrap(), 1);
    assert_eq!(client.has_voted(&voter1), true);

    // Verify event
    let events = env.events().all();
    assert_eq!(events.len(), 1);
}
