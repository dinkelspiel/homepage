FROM node:iron
RUN npm install -g pnpm@9.1.0
WORKDIR /usr/src/app
RUN ls
SHELL ["/bin/bash", "--login", "-c"]
ENV SHELL bash
COPY . .
RUN mkdir -p /.cache/pnpm/dlx
RUN chmod 777 /.cache/pnpm/dlx/ -R
RUN mkdir -p /usr/src/app/.next/cache/fetch-cache
RUN chmod 777 /usr/src/app/.next/cache -R
RUN chmod 777 /usr/src/app -R
RUN pnpm install
ENV SKIP_ENV_VALIDATION=true
RUN pnpm build
CMD ["pnpm", "start"]
