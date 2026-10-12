
const bcrypt = require("bcryptjs");
const pool = require("./db");

async function updatePasswords() {
    try {
        const users = [
            {
                user_id: "isaac",
                password: "IsaacDemo123!"
            },
            {
                user_id: "maya",
                password: "MayaDemo123!"
            },
            {
                user_id: "alex",
                password: "AlexDemo123!"
            }
        ];

        for (const user of users) {
            // turns each password into a hash before saving
            const hashedPassword = await bcrypt.hash(user.password, 10);

            await pool.query(
                "UPDATE users SET password = $1 WHERE user_id = $2",
                [hashedPassword, user.user_id]
            );

            console.log(`Updated password for ${user.user_id}`);
        }

        console.log("All demo passwords updated!");
    } catch (error) {
        console.error("Error updating passwords:", error.message);
    } finally {
        await pool.end();
    }
}

updatePasswords();