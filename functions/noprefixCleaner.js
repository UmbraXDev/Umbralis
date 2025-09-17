const fs = require("fs");
const path = require("path");

const npPath = path.join(__dirname, "../database/np.json");

function startNoPrefixCleaner(client) {
    console.log("[AutoClean] NoPrefix cleaner started.");

    setInterval(async () => {
        let npData;
        try {
            npData = JSON.parse(fs.readFileSync(npPath, "utf8"));
        } catch (err) {
            console.error("[AutoClean] Failed to read np.json:", err);
            return;
        }

        const now = Date.now();
        let changed = false;

        for (const [userId, data] of Object.entries(npData)) {
            if (data.time && data.time <= now) {
                try {
                    const user = await client.users.fetch(userId);
                    await user.send("⚠️ Your **no-prefix access** has expired. You now need to use the prefix for bot commands.");
                } catch (e) {
                    console.warn(`[AutoClean] Could not DM user ${userId}`);
                }

                delete npData[userId];
                changed = true;
            }
        }

        if (changed) {
            fs.writeFileSync(npPath, JSON.stringify(npData, null, 2));
            delete require.cache[require.resolve("../database/np.json")];
        }
    }, 60 * 1000);
}

module.exports = startNoPrefixCleaner;
