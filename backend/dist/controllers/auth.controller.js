"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        const passwordValid = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!passwordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }
        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                success: false,
                message: "User account is not active",
            });
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            role: user.role,
        }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        res.json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
};
exports.login = login;
