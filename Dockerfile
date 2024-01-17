FROM node:latest
WORKDIR /
COPY . .
RUN npm install
RUN npx prisma generate
EXPOSE 8080
ENTRYPOINT ["node", "app.js"]