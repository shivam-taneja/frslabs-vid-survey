const { execSync } = require("child_process");
const os = require("os");

console.log("Checking system requirements...");

const checkCommand = (cmd, name) => {
  const checkStr =
    os.platform() === "win32" ? `where ${cmd}` : `command -v ${cmd}`;

  try {
    execSync(checkStr, { stdio: "ignore" });
    return true;
  } catch (err) {
    console.error(`Error: ${name} is not installed or not in your PATH.`);
    return false;
  }
};

const hasNode = checkCommand("node", "Node.js");
const hasDocker = checkCommand("docker", "Docker");

if (!hasNode || !hasDocker) {
  console.error(
    "Missing dependencies. Please install Docker and Node.js, then try again.",
  );

  process.exit(1);
}

console.log("All dependencies found. Starting process...");
