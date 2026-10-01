rm -rf /home/noe/WSLProjects/Bar/CETEN-OpenBar-bar/frontend-2/.next

clear

fuser -k 5174/tcp 5173/tcp 8080/tcp 3000/tcp

npx concurrently \
  --names "PROXY,BACKD,FR-V2,FRONT,FAKED" \
  --prefix-colors "blue,green,magenta,cyan" \
  "npx local-ssl-proxy --key /home/noe/WSLProjects/Bar/CETEN-OpenBar-bar/frontend-2/certs/local.key --cert /home/noe/WSLProjects/Bar/CETEN-OpenBar-bar/frontend-2/certs/local.crt --source 5173 --target 5174 -n 0.0.0.0" \
  "cd /home/noe/WSLProjects/Bar/CETEN-OpenBar-bar/backend && go run cmd/bar/main.go" \
  "cd /home/noe/WSLProjects/Bar/CETEN-OpenBar-bar/frontend-2 && yarn dev-https" \
  "cd /home/noe/WSLProjects/Bar/CETEN-OpenBar-bar/frontend && bun dev --port 5174 --host 0.0.0.0" \
  "cd /home/noe/WSLProjects/Bar/CETEN-OpenBar-bar/fake && node index"
