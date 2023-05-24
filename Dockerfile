FROM node:14
ENV PORT 8080
EXPOSE 8080

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json .
RUN npm install
RUN npm install --save-dev @types/lodash
COPY . .

CMD ["npm", "start"]