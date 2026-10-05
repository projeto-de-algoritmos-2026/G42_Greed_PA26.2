const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const port = 3000;

app.use(cors());

app.get('/api/route', (req, res) => {
    const source = req.query.source;
    const target = req.query.target;

    if (!source || !target) {
        return res.status(400).json({ error: "Missing source or target parameters" });
    }

    const command = `../build/urban_router "${source}" "${target}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({
                error: error.message,
                stderr: stderr
            });
        }

        try {
            const parsedOutput = JSON.parse(stdout);
            res.json(parsedOutput);
        } catch (parseError) {
            res.status(500).json({
                error: parseError.message,
                rawOutput: stdout
            });
        }
    });
});

app.get('/api/schedule', (req, res) => {
    exec('../build/urban_router --schedule', (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({
                error: error.message,
                stderr: stderr
            });
        }

        try {
            const parsedOutput = JSON.parse(stdout);
            res.json(parsedOutput);
        } catch (parseError) {
            res.status(500).json({
                error: parseError.message,
                rawOutput: stdout
            });
        }
    });
});

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));