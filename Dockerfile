FROM node:18.20.3
WORKDIR /nodeapp
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 8000
CMD ["npm","run","start"]
