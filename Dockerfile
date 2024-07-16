FROM node:latest
WORKDIR /
COPY . .
RUN npm install
RUN npx prisma generate
RUN npx prisma db push
RUN npx prisma db seed
EXPOSE 8080
ENTRYPOINT ["node", "app.js"]