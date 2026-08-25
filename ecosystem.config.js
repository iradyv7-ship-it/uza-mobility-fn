module.exports = {
  apps: [{
    name: 'uza-frontend',
    script: 'node_modules/.bin/next',
    args: 'start -p 3001',
    cwd: '/home/uzamobility/uza-mobility-fn',
    env: {
      NODE_ENV: 'production',
      AUTH_SECRET: 'bJ2DxZtp728Rrwg3BY+hOqvhuztjT/eKEMcOnvoHkbQ=',
      NEXTAUTH_SECRET: 'bJ2DxZtp728Rrwg3BY+hOqvhuztjT/eKEMcOnvoHkbQ=',
      NEXTAUTH_URL: 'https://uzamobility.com',
      NEXT_PUBLIC_APP_URL: 'https://uzamobility.com',
      NEXT_PUBLIC_API_URL: 'https://uzamobility.com',
    }
  }]
}
