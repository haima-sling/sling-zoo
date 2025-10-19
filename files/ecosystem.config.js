module.exports = {
  apps: [{
    name: 'zoo-management',
    script: './src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    max_memory_restart: '500M',
    error_file: './logs/error/pm2-error.log',
    out_file: './logs/access/pm2-out.log',
    log_file: './logs/access/pm2-combined.log',
    time: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 5000,
    kill_timeout: 5000
  }]
};
