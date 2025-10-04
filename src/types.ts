export enum Role {
    USER = "user",
    MODEL = "model",
}

export interface Message {
    role: Role;
    text: string;
}

export interface Test {
    description: string;
    code: string; // e.g., "add(2, 3) === 5"
}

export interface TestResult {
    description: string;
    passed: boolean;
    error?: string;
}

export interface TutorResponse {
    explanation: string;
    challenge: string;
    tests: Test[];
}
