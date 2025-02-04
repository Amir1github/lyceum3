import { NextResponse } from 'next/server';

const ADMIN_PASSWORD = 'h586t'; // Replace with your admin password

// Handle GET requests
export async function GET(request) {
  const adminPassword = request.headers.get('x-admin-password');
  const isAdmin = adminPassword === ADMIN_PASSWORD;
  return NextResponse.json({ isAdmin });
}

  