const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
            return res.status(400).json({ error: 'A student with this email already exists.'});
        }

        // temporary password using bcrypt

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

        // send secure response

        return res.status(201).json({
            message: 'Student registered successfully!',
            student: {
                id: newStudent.id,
                name: newStudent.name,
                email: newStudent.email,
                passwordChanged: newStudent.passwordChanged
            },

            temporaryPassword
        });

    } catch (error) {
        next(error);
    }
};