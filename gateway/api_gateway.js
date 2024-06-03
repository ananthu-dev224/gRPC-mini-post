const express = require('express')
const app = express()
const { createProxyMiddleware } = require('http-proxy-middleware')

const PORT = 4000;

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// Proxy configurations
app.use('/auth', createProxyMiddleware({
    target: 'http://127.0.0.1:4001',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: http://127.0.0.1:4001${req.url}`);
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy error');
    }
}));

app.use('/post', createProxyMiddleware({
    target: 'http://127.0.0.1:4002',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: http://127.0.0.1:4002${req.url}`);
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy error');
    }
}));

app.use('/comment', createProxyMiddleware({
    target: 'http://127.0.0.1:4003',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying request to: http://127.0.0.1:4003${req.url}`);
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy error');
    }
}));

app.listen(PORT, () => {
    console.log(`Gateway at http://127.0.0.1:${PORT}`)
})