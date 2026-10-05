const express = require('express');
const cors = require('cors');
const { exec, execFile } = require('child_process');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

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

app.post('/api/schedule', (req, res) => {
    const tasks = req.body && req.body.tasks !== undefined ? req.body.tasks : [];

    if (!Array.isArray(tasks)) {
        return res.status(400).json({ status: 'error', error: 'tasks must be an array' });
    }

    const isValidTask = (task) =>
        task !== null &&
        typeof task === 'object' &&
        typeof task.id === 'string' &&
        task.id.trim() !== '' &&
        typeof task.destination === 'string' &&
        task.destination.trim() !== '' &&
        Number.isInteger(task.startTime) &&
        Number.isInteger(task.endTime) &&
        task.startTime >= 0 &&
        task.endTime > task.startTime;

    if (!tasks.every(isValidTask)) {
        return res.status(400).json({
            status: 'error',
            error: 'Each task requires id, destination, startTime and endTime with endTime > startTime'
        });
    }

    const args = tasks.flatMap((task) => [
        task.id.trim(),
        task.destination.trim(),
        String(task.startTime),
        String(task.endTime)
    ]);

    execFile('../build/urban_router', ['--schedule', ...args], (error, stdout, stderr) => {
        let parsedOutput;

        try {
            parsedOutput = JSON.parse(stdout);
        } catch (parseError) {
            return res.status(500).json({
                error: error ? error.message : parseError.message,
                stderr: stderr,
                rawOutput: stdout
            });
        }

        if (error || parsedOutput.status === 'error') {
            return res.status(400).json({
                ...parsedOutput,
                error: parsedOutput.message || (error && error.message)
            });
        }

        res.json(parsedOutput);
    });
});

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));