# Node.js Development Setup

We'll install a recent version of [Node.js](https://nodejs.org/en/) using [nvm](https://github.com/nvm-sh/nvm).
We'll also install [Yarn 1.x](https://classic.yarnpkg.com/en/) package manager alongside the
standard [npm CLI](https://docs.npmjs.com/about-npm).


1. Install nvm using Git:
   ```bash
   cd ~/
   git clone https://github.com/nvm-sh/nvm.git .nvm
   cd ~/.nvm
   git checkout v0.39.5
   ```

2. Add the following at the end of your `~/.bashrc`:
   ```bash
   ###
   # nvm
   # source: https://github.com/nvm-sh/nvm#git-install
   ###
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"                   # This loads nvm
   [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion
   
   ###
   # yarn global symlinks directory (yarn global bin)
   # see https://classic.yarnpkg.com/en/docs/cli/global
   ###
   # export PATH="$(yarn global bin):$PATH"
   # to speed things up, inline the path directly:
   export PATH="$HOME/.yarn/bin:$PATH"
   ```

3. Restart your terminal. Verify nvm works (should print something like `0.39.5`):
   ```bash
   nvm -v
   ```

4. Install the latest Node.js 20:
   ```bash
   nvm install 20.*
   ```

5. Verify Node.js is installed and active (should print something like `v20.6.1`):
   ```bash
   node -v
   ```

6. Upgrade bundled npm and install yarn:
   ```bash
   npm --global install npm yarn
   ```

7. Check the installed versions:
   ```bash
   npm -v
   yarn -v
   ```

8. Set yarn prefix for global bins (it's the default, but to be future-proof):
   ```bash
   yarn config set prefix ~/.yarn
   ```

9. Install some useful global packages using Yarn:
   ```bash
   yarn global add node-gyp nodemon sort-package-json doctoc
   ```

10. Verify that Yarn global packages binaries are on your PATH (should print `3.0.1`):
	```bash
	nodemon -v
	```

That's all!
