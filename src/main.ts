import express from 'express';
import 'dotenv/config';
import { createApp } from './init';

const { config, app } = createApp();

const port = config.OSW_PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
})