const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendTemporaryPasswordEmail } = require('../services/email.service');
const jwt = require('jsonwebtoken');

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({ adapter });

exports.register = async (req, res, next) => {
    try {
        const {
            name,
            email,
            mobile,
            qualification,
            emergencyContact,
            address,
            profilePhoto
        } = req.body;

        // validating required fields

        if (!name || !email || !mobile || !qualification || !emergencyContact || !address) {
            return res.status(400).json({error: 'All required fields must be provided.'});
        }

        // normalize email

        const normalizedEmail = email.trim().toLowerCase();

        // checking if student already exists

        const studentExists = await prisma.student.findUnique({
            where: { email: normalizedEmail }
        });

        if (studentExists) {
            return res.status(409).json({ error: 'A student with this email already exists.'});
        }

        // temporary password hashing

        const temporaryPassword = crypto.randomBytes(6).toString('base64url');
        
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
        
        // create a new student record

        const newStudent = await prisma.student.create({
            data: {
                name: name.trim(),
                email: normalizedEmail,
                mobile: mobile.trim(),
                qualification: qualification.trim(),
                emergencyContact: emergencyContact.trim(),
                address: address.trim(),
                password: hashedPassword,
                profilePhoto: profilePhoto || null
            }
        });

        // send temporary password to email
    try {
        await sendTemporaryPasswordEmail({
            recipientEmail: newStudent.email,
            studentName: newStudent.name,
            temporaryPassword
        });
    } catch (emailError) {
        await prisma.student.delete({
            where: { id: newStudent.id }
        });

        console.error(`Temporary password email failed:`, emailError);

        return res.status(502).json({
            error:
                'Registration could not be completed because the temporary password email failed to send.'
        });
    }

        // send secure response

        return res.status(201).json({
            message: 'Student registered successfully! A temporary password has been sent to your email.',
            student: {
                id: newStudent.id,
                name: newStudent.name,
                email: newStudent.email,
                passwordChanged: newStudent.passwordChanged
            },

        });

    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // validate required fields
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // find student by email
        const student = await prisma.student.findUnique({
            where: {
                email: normalizedEmail
            }
        });

        if (!student) {
            return res.status(401).json({
                error: 'Invalid email or password.'
            });
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            student.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                error: 'Invalid email or password.'
            });
        }

        const payload = {
            studentId: student.id,
            email: student.email,
            passwordChanged: student.passwordChanged
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        if (!student.passwordChanged) {
            return res.status(200).json({
                message: 'Login successful. Password change required.',
                requiresPasswordChange: true,
                token: token,
                student: {
                    id: student.id,
                    name: student.name,
                    email: student.email
                }
            });
        }

        return res.status(200).json({
            message: 'Login successful.',
            requiresPasswordChange: false,
            token: token,
            student: {
                id: student.id,
                name: student.name,
                email: student.email
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const studentId = req.user.studentId;

        const {
            currentPassword,
            newPassword,
            confirmPassword
        } = req.body;

        // validate required fields
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                error: 'All fields are required.'
            });
        }

        // check new pass validity

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                error: 'New password and confirmation do not match.'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                error: 'New password must contain at least 8 characters.'
            });
        }

        // student not in database

        const student = await prisma.student.findUnique({
            where: { id: studentId }
        });

        if (!student) {
            return res.status(401).json({ error: 'Unable to change password.'});
        }

        const isPasswordCorrect = await bcrypt.compare(
            currentPassword,
            student.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                error: 'Unable to change password.'
            });
        }

        if (student.passwordChanged) {
            return res.status(409).json({
                error: 'The temporary password has already been replaced.'
            });
        }

        const sameAsTemp = await bcrypt.compare(
            newPassword,
            student.password
        );

        if (sameAsTemp) {
            return res.status(400).json({
                error: 'The new password must be different from the temporary password.'
            });
        }

        const hashedNewPass = await bcrypt.hash(newPassword, 10);

        const updatedStudent = await prisma.student.update({
            where: {
                id: student.id
            },
            data: {
                password: hashedNewPass,
                passwordChanged: true
            }
        });

        const newToken = jwt.sign({
                studentId: updatedStudent.id,
                email: updatedStudent.email,
                passwordChanged: updatedStudent.passwordChanged
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        return res.status(200).json({
            message: 'Password changed successfully.',
            token: newToken,
            requiresPasswordChange: false
        });
        
    } catch (error) {
        next(error);
    }
};

exports.getProfile = (req, res) => {
    return res.status(200).json({
        user: req.user
    });
};