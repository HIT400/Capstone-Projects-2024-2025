import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const saltRounds = 10;

// Function to fetch districts from the database
const getDistrictsFromDatabase = async () => {
    try {
        const query = 'SELECT id, name FROM districts ORDER BY name';
        const result = await pool.query(query);

        if (result.rows.length === 0) {
            console.warn('No districts found in the database. Using default districts.');
            return [
                { id: 1, name: 'Harare' },
                { id: 2, name: 'Bulawayo' },
                { id: 3, name: 'Chitungwiza' },
                { id: 4, name: 'Mutare' },
                { id: 5, name: 'Gweru' }
            ];
        }

        console.log(`Found ${result.rows.length} districts in the database.`);
        return result.rows;
    } catch (error) {
        console.error('Error fetching districts from database:', error.message);
        console.warn('Using default districts due to database error.');
        return [
            { id: 1, name: 'Harare' },
            { id: 2, name: 'Bulawayo' },
            { id: 3, name: 'Chitungwiza' },
            { id: 4, name: 'Mutare' },
            { id: 5, name: 'Gweru' }
        ];
    }
};

// Function to fetch inspection types from the database
const getInspectionTypesFromDatabase = async () => {
    try {
        const query = 'SELECT id, name FROM inspection_types ORDER BY name';
        const result = await pool.query(query);

        if (result.rows.length === 0) {
            console.warn('No inspection types found in the database. Using default types.');
            return [
                { id: 1, name: 'Foundation' },
                { id: 2, name: 'Structural' },
                { id: 3, name: 'Final' },
                { id: 4, name: 'General' }
            ];
        }

        console.log(`Found ${result.rows.length} inspection types in the database.`);
        return result.rows;
    } catch (error) {
        console.error('Error fetching inspection types from database:', error.message);
        console.warn('Using default inspection types due to database error.');
        return [
            { id: 1, name: 'Foundation' },
            { id: 2, name: 'Structural' },
            { id: 3, name: 'Final' },
            { id: 4, name: 'General' }
        ];
    }
};

// Generate a random Zimbabwe National ID
const generateZimNationalId = () => {
    // Format: XX-YYYYYYYYXNN
    const registrationDistrict = Math.floor(Math.random() * 99).toString().padStart(2, '0');
    const serialNumber = Math.floor(Math.random() * 9999999).toString().padStart(7, '0');
    const checkDigit = Math.floor(Math.random() * 9);
    const originDistrict = Math.floor(Math.random() * 99).toString().padStart(2, '0');

    return `${registrationDistrict}-${serialNumber}${checkDigit}${originDistrict}`;
};

// Generate a random work ID
const generateWorkId = (firstName, lastName) => {
    const prefix = 'ZB';
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
    const number = Math.floor(Math.random() * 9999).toString().padStart(4, '0');

    return `${prefix}${initials}${number}`;
};

// Generate a random license number
const generateLicenseNumber = () => {
    const prefix = 'LIC';
    const year = new Date().getFullYear();
    const number = Math.floor(Math.random() * 999999).toString().padStart(6, '0');

    return `${prefix}/${year}/${number}`;
};

// Generate a random phone number
const generatePhoneNumber = () => {
    const prefixes = ['077', '078', '071', '073'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 9999999).toString().padStart(7, '0');

    return `${prefix}${number}`;
};

// List of inspectors to add
const inspectors = [
    { firstName: 'Tawanda', lastName: 'Mudzamiri' },
    { firstName: 'Vimbai', lastName: 'Chikowore' },
    { firstName: 'Tatenda', lastName: 'Nyamupaguma' },
    { firstName: 'Tinashe', lastName: 'Mugabe' },
    { firstName: 'Rujeko', lastName: 'Makamure' },
    { firstName: 'Farai', lastName: 'Muchengeti' },
    { firstName: 'Chenai', lastName: 'Zvinavashe' },
    { firstName: 'Munyaradzi', lastName: 'Mavhunga' },
    { firstName: 'Tafadzwa', lastName: 'Chingono' },
    { firstName: 'Tariro', lastName: 'Gweshe' },
    { firstName: 'Shamiso', lastName: 'Mutasa' },
    { firstName: 'Ratidzo', lastName: 'Makoni' },
    { firstName: 'Kudakwashe', lastName: 'Choto' },
    { firstName: 'Mufaro', lastName: 'Chidembo' },
    { firstName: 'Tanaka', lastName: 'Vheremu' },
    { firstName: 'Chiedza', lastName: 'Mataranyika' },
    { firstName: 'Tendai', lastName: 'Gombedza' },
    { firstName: 'Runako', lastName: 'Manyika' },
    { firstName: 'Kudzanai', lastName: 'Bvumbe' },
    { firstName: 'Makanaka', lastName: 'Mhondoro' },
    { firstName: 'Ruvimbo', lastName: 'Mutandwa' },
    { firstName: 'Anesu', lastName: 'Jabangwe' },
    { firstName: 'Rutendo', lastName: 'Muzenda' },
    { firstName: 'Nyasha', lastName: 'Chaurura' },
    { firstName: 'Simbarashe', lastName: 'Mabika' },
    { firstName: 'Maruva', lastName: 'Hanyani' },
    { firstName: 'Tanyaradzwa', lastName: 'Chikafu' },
    { firstName: 'Takudzwa', lastName: 'Muzamhindo' }
];

// Function to create an inspector
const createInspector = async (inspector, districts, inspectionTypes) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Generate inspector data
        const email = `${inspector.firstName.toLowerCase()}${inspector.lastName.toLowerCase()}@zimbuilds.com`;
        const password = 'Password123!'; // Default password
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const nationalId = generateZimNationalId();
        const contactNumber = generatePhoneNumber();

        // Get random districts for address and assignment
        const addressDistrict = districts[Math.floor(Math.random() * districts.length)];
        const residentialDistrict = districts[Math.floor(Math.random() * districts.length)];
        const physicalAddress = `${Math.floor(Math.random() * 999)} ${addressDistrict.name} Road, ${residentialDistrict.name}`;

        const workId = generateWorkId(inspector.firstName, inspector.lastName);
        const licenseNumber = generateLicenseNumber();

        // Get random district and inspection type for assignment
        const assignedDistrict = districts[Math.floor(Math.random() * districts.length)].name;
        const inspectionType = inspectionTypes[Math.floor(Math.random() * inspectionTypes.length)].name;

        // First create user
        const userQuery = `
            INSERT INTO users (
                email, password_hash, role, first_name, last_name,
                contact_number, physical_address, national_id_number
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id;
        `;

        const userValues = [
            email,
            hashedPassword,
            'inspector',
            inspector.firstName,
            inspector.lastName,
            contactNumber,
            physicalAddress,
            nationalId
        ];

        console.log(`Creating user for ${inspector.firstName} ${inspector.lastName}...`);
        const userResult = await client.query(userQuery, userValues);
        const userId = userResult.rows[0].id;

        // Then create inspector
        const inspectorQuery = `
            INSERT INTO inspectors (
                user_id, work_id, license_number,
                available, assigned_district, inspection_type
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const inspectorValues = [
            userId,
            workId,
            licenseNumber,
            true,
            assignedDistrict,
            inspectionType
        ];

        console.log(`Creating inspector record for ${inspector.firstName} ${inspector.lastName}...`);
        await client.query(inspectorQuery, inspectorValues);

        await client.query('COMMIT');
        console.log(`Successfully created inspector: ${inspector.firstName} ${inspector.lastName} (${email})`);

        return {
            name: `${inspector.firstName} ${inspector.lastName}`,
            email,
            district: assignedDistrict,
            inspectionType,
            workId,
            licenseNumber
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error creating inspector ${inspector.firstName} ${inspector.lastName}:`, error.message);
        return null;
    } finally {
        client.release();
    }
};

// Main function to add all inspectors
const addInspectors = async () => {
    console.log('Starting to add inspectors...');

    // Fetch districts and inspection types from the database
    console.log('Fetching districts from the database...');
    const districts = await getDistrictsFromDatabase();

    console.log('Fetching inspection types from the database...');
    const inspectionTypes = await getInspectionTypesFromDatabase();

    const results = {
        success: [],
        failed: []
    };

    for (const inspector of inspectors) {
        try {
            const result = await createInspector(inspector, districts, inspectionTypes);
            if (result) {
                results.success.push(result);
            } else {
                results.failed.push(`${inspector.firstName} ${inspector.lastName}`);
            }
        } catch (error) {
            console.error(`Error processing inspector ${inspector.firstName} ${inspector.lastName}:`, error);
            results.failed.push(`${inspector.firstName} ${inspector.lastName}`);
        }
    }

    console.log('\n--- SUMMARY ---');
    console.log(`Successfully added ${results.success.length} inspectors`);
    console.log(`Failed to add ${results.failed.length} inspectors`);

    if (results.failed.length > 0) {
        console.log('\nFailed inspectors:');
        results.failed.forEach(name => console.log(`- ${name}`));
    }

    console.log('\nSuccessfully added inspectors:');
    results.success.forEach(inspector => {
        console.log(`- ${inspector.name} (${inspector.email})`);
        console.log(`  District: ${inspector.district}`);
        console.log(`  Inspection Type: ${inspector.inspectionType}`);
        console.log(`  Work ID: ${inspector.workId}`);
        console.log(`  License: ${inspector.licenseNumber}`);
        console.log('');
    });

    // Close the pool
    await pool.end();
    console.log('Database connection closed');
};

// Run the script
addInspectors().catch(error => {
    console.error('Error in main script execution:', error);
    process.exit(1);
});
