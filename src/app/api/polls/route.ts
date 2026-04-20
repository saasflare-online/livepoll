import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Poll from "@/models/Poll";

export async function GET() {
  await dbConnect();
  try {
    let poll = await Poll.findOne({ id: "active_poll" });
    if (!poll) {
      poll = await Poll.create({
        id: "active_poll",
        votes: { 0: 15, 1: 5, 2: 8, 3: 12 },
        voters: []
      });
    }
    return NextResponse.json(poll);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch poll" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { address, optionIndex } = await request.json();

    if (!address || typeof optionIndex !== "number") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const poll = await Poll.findOne({ id: "active_poll" });
    if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 });

    // Global double voting check for Demo Mode
    if (poll.voters.includes(address)) {
      return NextResponse.json({ error: "You have already voted" }, { status: 400 });
    }

    // Atomic update
    const update = {
      $inc: { [`votes.${optionIndex}`]: 1 },
      $push: { voters: address }
    };

    const updatedPoll = await Poll.findOneAndUpdate(
      { id: "active_poll" },
      update,
      { new: true }
    );

    return NextResponse.json(updatedPoll);
  } catch (error) {
    return NextResponse.json({ error: "Failed to post vote" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  await dbConnect();
  try {
    const { question, options } = await request.json();
    const poll = await Poll.findOneAndUpdate(
      { id: "active_poll" },
      { 
        id: "active_poll",
        votes: options.reduce((acc: any, _: any, i: number) => ({ ...acc, [i]: 0 }), {}),
        voters: []
      },
      { upsert: true, new: true }
    );
    return NextResponse.json(poll);
  } catch (error) {
    return NextResponse.json({ error: "Failed to initialize poll" }, { status: 500 });
  }
}
