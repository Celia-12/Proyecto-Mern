import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

// Secret key for signing the JWT (in production, use an environment variable)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-key-for-jwt-signing-demo-2024"
);

// Validation helpers (server-side mirror of client-side rules)
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password: string): boolean {
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasPunctuation = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  return hasUppercase && hasNumber && hasPunctuation;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Server-side validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "El formato de email no es válido" },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: "La contraseña no cumple con los requisitos mínimos" },
        { status: 400 }
      );
    }

    // Generate JWT token using jose
    const token = await new SignJWT({
      sub: email,
      email: email,
      role: "user",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .setIssuer("jwt-auth-demo")
      .setAudience("jwt-auth-demo-client")
      .sign(JWT_SECRET);

    return NextResponse.json({
      success: true,
      message: "Autenticación exitosa",
      token,
      user: {
        email,
        role: "user",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
