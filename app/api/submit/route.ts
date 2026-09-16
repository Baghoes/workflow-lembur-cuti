import { NextResponse } from "next/server"

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz9xRBuFYDzGipEKtGFmdaksQYzHLm50UpBG3Hguh7pQJUjNx2LAuj46y5pTAdZT_bDBA/exec"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "follow",
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Gagal terhubung ke server spreadsheet." },
      { status: 500 }
    )
  }
}
