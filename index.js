const http = require("http");
const morgan = require("morgan");
const express = require("express");

const logger = morgan("tiny");
const PORT = 3000;

const app = express();

const server = http.createServer(app);
