Here’s a list of **essential Mac Terminal commands** along with their usage and examples:  

### **1. Basic File & Directory Commands**  
| Command | Description | Example |
|---------|------------|---------|
| `pwd` | Print current working directory | `pwd` → `/Users/yourname` |
| `ls` | List files & directories | `ls -l` (detailed list) |
| `cd` | Change directory | `cd Documents` → Moves to "Documents" |
| `mkdir` | Create a new directory | `mkdir NewFolder` |
| `touch` | Create a new file | `touch file.txt` |
| `cp` | Copy files/directories | `cp file.txt ~/Downloads/` |
| `mv` | Move/rename files | `mv old.txt new.txt` (rename) |
| `rm` | Delete a file | `rm file.txt` (⚠️ irreversible!) |
| `rmdir` | Remove empty directory | `rmdir EmptyFolder` |
| `rm -rf` | Force delete a directory & contents | `rm -rf FolderName` (⚠️ dangerous) |

---

### **2. File Viewing & Editing**  
| Command | Description | Example | 
|---------|------------|---------|
| `cat` | Display file content | `cat notes.txt` |
| `less` | View file page by page | `less longfile.txt` (press `q` to quit) |
| `nano` | Simple text editor | `nano file.txt` (Ctrl+O to save, Ctrl+X to exit) |
| `open` | Open a file/folder | `open .` (opens current dir in Finder) |

---

### **3. System & Process Management**  
| Command | Description | Example |
|---------|------------|---------|
| `top` | Show running processes | `top` (press `q` to quit) |
| `ps` | List processes | `ps aux` (detailed list) |
| `kill` | Terminate a process | `kill -9 [PID]` (force stop) |
| `df` | Disk space usage | `df -h` (human-readable) |
| `du` | Directory space usage | `du -sh *` (summarize sizes) |

---

### **4. Network Commands**  
| Command | Description | Example |
|---------|------------|---------|
| `ping` | Check network connection | `ping google.com` |
| `ifconfig` | Network interface info | `ifconfig en0` |
| `ssh` | Remote login | `ssh user@192.168.1.1` |
| `scp` | Securely copy files over SSH | `scp file.txt user@host:/path` |

---

### **5. Permissions & Ownership**  
| Command | Description | Example |
|---------|------------|---------|
| `chmod` | Change file permissions | `chmod 755 script.sh` |
| `chown` | Change file owner | `sudo chown user:group file.txt` |

---

### **6. Searching & Filtering**  
| Command | Description | Example |
|---------|------------|---------|
| `grep` | Search text in files | `grep "hello" file.txt` |
| `find` | Search for files | `find ~ -name "*.txt"` |
| `which` | Locate a command | `which python` |

---

### **7. Miscellaneous Useful Commands**  
| Command | Description | Example |
|---------|------------|---------|
| `history` | Show command history | `history` |
| `clear` | Clear Terminal screen | `clear` |
| `sudo` | Run as admin | `sudo command` (requires password) |
| `say` | Make Mac speak | `say "Hello World"` 😄 |

---

### **Example Workflow**  
1. Navigate to **Documents** → `cd Documents`  
2. Create a **new folder** → `mkdir Project`  
3. Enter the folder → `cd Project`  
4. Create a **file** → `touch app.js`  
5. Edit it → `nano app.js` (add code, save)  
6. List files → `ls -l`  
7. Copy to **Desktop** → `cp app.js ~/Desktop/`  

Would you like more details on any command? 🚀

To see all software you’ve installed via Homebrew, you can run:

```bash
brew list
```

That will list all installed formulae (command-line tools) and casks (GUI apps) together.

---

### If you want them separated:

**Formulae only (CLI tools):**

```bash
brew list --formula
```

**Casks only (GUI apps):**

```bash
brew list --cask
```

---

### If you want versions too:

```bash
brew list --versions
```

or separately:

```bash
brew list --formula --versions
brew list --cask --versions
```

---

If you want a **full list with description**:

```bash
brew info --installed
```

---

Do you want me to also give you a **command that exports this list so you can reinstall everything on another Mac**? That’s handy for backups.

Once you’ve installed **MongoDB Compass** with:

```bash
brew install --cask mongodb-compass
```

You can open it in a few ways:

---

**1️⃣ From Terminal:**

```bash
open -a "MongoDB Compass"
```

---

**2️⃣ From Spotlight Search (Cmd ⌘ + Space):**
Type **MongoDB Compass** and hit **Enter**.

---

**3️⃣ From Applications Folder:**

* Go to **Finder → Applications**
* Double-click **MongoDB Compass**.

---

Once it opens:

* Click **New Connection**
* Enter your connection string, e.g.

  ```
  mongodb://localhost:27017
  ```
* Click **Connect** to view your databases and collections.

---

Do you want me to give you the **Mongo Express setup** as well so you can view MongoDB in your browser instead of opening Compass? That way you can use either method.

Sure — let’s go through **all the commands I mentioned** earlier step by step, and I’ll explain what each one does in the context of your MongoDB setup and the error you got.

---

## **1. Checking your current MongoDB installation**

```bash
brew list
```

* **Purpose:** Shows all software installed via Homebrew.
* Useful to confirm if MongoDB (`mongodb-community`) is installed.
* Example output:

  ```
  mongodb-community  node  git
  ```

---

```bash
brew list --versions
```

* **Purpose:** Shows installed packages **with versions**.
* Example output:

  ```
  mongodb-community 8.0.12
  ```

---

## **2. Uninstalling incompatible MongoDB**

You got this error:

```
built for macOS 14.0 which is newer than running OS
```

So we remove the current version before installing a compatible one.

```bash
brew uninstall mongodb-community
```

* **Purpose:** Removes the installed MongoDB formula.
* Example:

  ```
  Uninstalling /opt/homebrew/Cellar/mongodb-community/8.0.12... (20 files, 500MB)
  ```

---

## **3. Tapping MongoDB’s official formula repository**

```bash
brew tap mongodb/brew
```

* **Purpose:** Adds MongoDB’s official Homebrew “tap” (repository) so you can install older or specific versions like `mongodb-community@7.0`.

---

## **4. Installing a compatible MongoDB version**

```bash
brew install mongodb-community@7.0
```

* **Purpose:** Installs MongoDB 7.0, which is compatible with macOS 13 (Ventura) and avoids the symbol not found error.
* Example:

  ```
  ==> Installing mongodb-community@7.0
  🍺  /opt/homebrew/Cellar/mongodb-community@7.0/7.0.12: 20 files, 500MB
  ```

---

## **5. Starting MongoDB as a background service**

```bash
brew services start mongodb-community@7.0
```

* **Purpose:** Starts MongoDB automatically in the background on boot.
* Example:

  ```
  Successfully started `mongodb-community@7.0` (label: homebrew.mxcl.mongodb-community@7.0)
  ```

---

## **6. Running MongoDB manually**

```bash
mongod --dbpath /opt/homebrew/var/mongodb
```

* **Purpose:** Starts MongoDB manually using a specific data directory.
* Use this if you don’t want it running as a background service.
* Example:

  ```
  {"t":{"$date":"2025-08-14T15:00:00.000Z"},"s":"I", "c":"CONTROL",  "id":23456, "ctx":"main","msg":"Waiting for connections","attr":{"port":27017}}
  ```

---

## **7. Installing MongoDB Compass (GUI)**

```bash
brew install --cask mongodb-compass
```

* **Purpose:** Installs MongoDB’s official GUI for browsing and editing data.
* `--cask` is for GUI apps, `--formula` is for CLI tools.

---

## **8. Opening MongoDB Compass**

```bash
open -a "MongoDB Compass"
```

* **Purpose:** Opens Compass from Terminal.
* Alternatively:

  * Press **Cmd + Space**, type **MongoDB Compass**, and press **Enter**.
  * Or go to **Finder → Applications → MongoDB Compass**.

---

## **9. Connecting in Compass**

Inside Compass:

* In **New Connection**, enter:

  ```
  mongodb://localhost:27017
  ```
* Click **Connect** to see all your databases and collections.

---

✅ Following these commands in sequence will:

1. Remove the incompatible MongoDB version.
2. Install a version matching your macOS.
3. Start MongoDB so it’s ready for connections.
4. Give you a GUI (Compass) to explore your data.

---

If you want, I can also add **Mongo Express setup** to this list so you have a **browser-based MongoDB UI** without needing to open Compass. That could be useful when you’re testing APIs.

Got it — you want to know **other `sudo` commands** that could come into play during MongoDB setup or troubleshooting.
Normally, Homebrew avoids `sudo` for installing packages, but there are some cases where you might need it, especially if:

* You installed MongoDB manually (not via Homebrew)
* Your data directory permissions are wrong
* You’re running `mongod` directly without a Homebrew service

---

## **Common `sudo` Commands in MongoDB Setup & Fixes**

---

### **1️⃣ Check MongoDB service status (system-wide)**

```bash
sudo launchctl list | grep mongo
```

* Lists all running services and filters for `mongo`.
* Useful if MongoDB was installed as a system daemon outside of Homebrew.

---

### **2️⃣ Start MongoDB manually as root**

```bash
sudo mongod --dbpath /opt/homebrew/var/mongodb
```

* Forces `mongod` to run with root privileges (usually not recommended unless testing).
* Sometimes necessary if `/opt/homebrew/var/mongodb` has root-only permissions.

---

### **3️⃣ Fix MongoDB data directory permissions**

```bash
sudo chown -R $(whoami) /opt/homebrew/var/mongodb
```

* Gives your user account full access to the MongoDB data directory.
* Prevents "permission denied" errors when `mongod` starts.

---

### **4️⃣ Create the MongoDB data directory**

```bash
sudo mkdir -p /opt/homebrew/var/mongodb
```

* Creates the directory if it doesn’t exist.
* Needed when setting a custom `--dbpath`.

---

### **5️⃣ Change permissions for the data directory**

```bash
sudo chmod 755 /opt/homebrew/var/mongodb
```

* Ensures `mongod` can read and write to the directory.

---

### **6️⃣ Stop MongoDB system-wide**

```bash
sudo launchctl bootout system /Library/LaunchDaemons/org.mongodb.mongod.plist
```

* Stops a MongoDB instance that was installed manually and running as a system daemon.

---

### **7️⃣ Check which process is using port 27017**

```bash
sudo lsof -i :27017
```

* Shows which process is bound to MongoDB’s default port.
* If another process is using it, you’ll see its PID.

---

### **8️⃣ Kill a stuck MongoDB process**

```bash
sudo kill -9 <PID>
```

* Force-stops the MongoDB process when it won’t shut down normally.

---

💡 **Best practice:**
Use `sudo` only when dealing with system services, permissions, or processes. For Homebrew-managed MongoDB, most commands won’t need it because Homebrew keeps everything in `/opt/homebrew` under your user account.

---

If you want, I can make you a **MongoDB Setup Cheat Sheet** that includes *both* the Homebrew commands **and** these `sudo` commands so you have one quick reference file. That way you won’t have to look them up again.

Alright — let’s go step-by-step and cover **all the relevant macOS M1 (Apple Silicon) commands** you might use during MongoDB installation, troubleshooting, and running, explained with **examples** just like I did earlier.

Since you’re on a **Mac M1**, the paths and architecture are slightly different from Intel Macs:

* Homebrew is in `/opt/homebrew` (not `/usr/local`).
* ARM binaries sometimes cause compatibility issues, so you may need to run things in **Rosetta**.

---

## **1️⃣ Check Homebrew installation**

```bash
brew --version
```

**Purpose:** Confirms Homebrew is installed and working.
Example:

```
Homebrew 4.3.9
Homebrew/homebrew-core (no Git repository)
Homebrew/homebrew-cask (git revision c0b1; last commit 2025-08-14)
```

---

## **2️⃣ Show where Homebrew is installed**

```bash
which brew
```

Example output on M1:

```
/opt/homebrew/bin/brew
```

If it shows `/usr/local/bin/brew`, you’re running the Intel version.

---

## **3️⃣ List installed software**

```bash
brew list
```

Example:

```
git
node
mongodb-community
```

---

## **4️⃣ List with versions**

```bash
brew list --versions
```

Example:

```
mongodb-community 8.0.12
node 22.3.0
```

---

## **5️⃣ Remove a package**

```bash
brew uninstall mongodb-community
```

Example output:

```
Uninstalling /opt/homebrew/Cellar/mongodb-community/8.0.12... (500MB)
```

---

## **6️⃣ Add MongoDB’s official repo**

```bash
brew tap mongodb/brew
```

Example:

```
==> Tapping mongodb/brew
Cloning into '/opt/homebrew/Library/Taps/mongodb/homebrew-brew'...
Tapped 8 formulae (39 files, 200KB).
```

---

## **7️⃣ Install a specific version (macOS 13 compatible)**

```bash
brew install mongodb-community@7.0
```

Example:

```
🍺  /opt/homebrew/Cellar/mongodb-community@7.0/7.0.12: 20 files, 500MB
```

---

## **8️⃣ Start MongoDB as a background service**

```bash
brew services start mongodb-community@7.0
```

Example:

```
==> Successfully started `mongodb-community@7.0` (label: homebrew.mxcl.mongodb-community@7.0)
```

---

## **9️⃣ Stop the background service**

```bash
brew services stop mongodb-community@7.0
```

Example:

```
Stopping `mongodb-community@7.0`... (might take a while)
```

---

## **🔟 Run MongoDB manually**

```bash
mongod --dbpath /opt/homebrew/var/mongodb
```

Example:

```
{"t":{"$date":"2025-08-14T15:00:00.000Z"},"s":"I","c":"CONTROL","id":23456,"ctx":"main","msg":"Waiting for connections","attr":{"port":27017}}
```

---

## **1️⃣1️⃣ Create a data directory (if missing)**

```bash
sudo mkdir -p /opt/homebrew/var/mongodb
```

Example: *(no output if successful)*

---

## **1️⃣2️⃣ Fix ownership (M1 Homebrew user)**

```bash
sudo chown -R $(whoami) /opt/homebrew/var/mongodb
```

Example: *(no output if successful)*

---

## **1️⃣3️⃣ Check if MongoDB is running**

```bash
ps aux | grep mongod
```

Example:

```
youruser   5056   0.3  0.1  408636  1440   ??  S     1:03PM   0:03.21 mongod --dbpath /opt/homebrew/var/mongodb
```

---

## **1️⃣4️⃣ Find what’s using port 27017**

```bash
sudo lsof -i :27017
```

Example:

```
mongod  5056 youruser   15u  IPv4 0x12345678      0t0  TCP *:27017 (LISTEN)
```

---

## **1️⃣5️⃣ Kill a stuck MongoDB process**

```bash
sudo kill -9 5056
```

*(Replace 5056 with the PID from the previous command.)*

---

## **1️⃣6️⃣ Install MongoDB Compass GUI**

```bash
brew install --cask mongodb-compass
```

Example:

```
==> Downloading https://downloads.mongodb.com/compass/mongodb-compass-1.39.0-darwin-arm64.dmg
🍺  mongodb-compass was successfully installed!
```

---

## **1️⃣7️⃣ Open MongoDB Compass**

```bash
open -a "MongoDB Compass"
```

Example: *(GUI launches with connection screen)*

---

💡 On **Mac M1**, you also have the special case where you might need to run MongoDB under **Rosetta** if some dependencies are Intel-only. For that:

```bash
arch -x86_64 brew install mongodb-community@7.0
```

This forces Homebrew to install the Intel version inside `/usr/local` instead of `/opt/homebrew`.

---

If you want, I can now make you a **single MongoDB M1 Setup & Fix cheat sheet** with *both* these commands and explanations, so next time you can copy-paste them in order without rethinking the sequence. This would be super handy when you reinstall or upgrade macOS.
