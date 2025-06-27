const pandaTokenContract = "0x67c778b5e5705aaa46707f3f16e498beef627b0b";
const rewardWallet = "0xC38d265B08bD7960E964bD02D1cc81BE2E71d417";
const abstractProvider = new ethers.providers.JsonRpcProvider("https://api.mainnet.abs.xyz");

const canvas = document.getElementById("badgeCanvas");
const ctx = canvas.getContext("2d");

const flipSound = new Audio("https://github.com/ATOMNFT/Panda-Raid-Badge-Generator/blob/main/Audio/flipcard.mp3");

function selectImage(index) {
  document.querySelectorAll('input[type="radio"][name="badge"]').forEach((input, i) => {
    input.checked = (i + 1 === index);
  });
}

async function fetchPandaBalance(wallet) {
  const contract = new ethers.Contract(pandaTokenContract, [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ], abstractProvider);

  const [raw, decimals] = await Promise.all([
    contract.balanceOf(wallet),
    contract.decimals()
  ]);
  return parseFloat(ethers.utils.formatUnits(raw, decimals));
}

async function fetchTokenData(wallet) {
  const contract = new ethers.Contract(pandaTokenContract, [
    "event Transfer(address indexed from, address indexed to, uint256 value)"
  ], abstractProvider);

  const filter = contract.filters.Transfer(rewardWallet, wallet);
  const logs = await contract.queryFilter(filter);
  let total = 0n;

  for (const log of logs) {
    total += BigInt(log.args.value);
  }

  return Number(total) / 10 ** 18;
}

async function generateBadge() {
  const wallet = document.getElementById("walletInput").value.trim();
  if (!wallet) return alert("Enter your wallet address");

  document.getElementById("downloadBtn").disabled = true;

  const { x, y, width, height } = document.getElementById("generateBtn").getBoundingClientRect();
  particleBurst(x + width / 2, y + height / 2);

  const mode = document.querySelector('input[name="displayType"]:checked').value;
  const imageSrc = document.querySelector('input[name="badge"]:checked').value;
  
  flipSound.currentTime = 0; // reset if already playing
  flipSound.play();

  canvas.classList.add('flipping');
  setTimeout(() => {
    canvas.classList.remove('flipping');
  }, 600);

  let value = 0;
  try {
    if (mode === "balance") {
      value = await fetchPandaBalance(wallet);
    } else {
      value = await fetchTokenData(wallet);
    }
  } catch (err) {
    console.error("Fetch error:", err);
    alert("Error fetching data. Please check wallet address or try again later.");
    return;
  }

  const img = new Image();
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.font = `bold 24px '${document.getElementById("fontSelect").value}'`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(`${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} $PANDA`, canvas.width / 2, 338);

    document.getElementById("downloadBtn").disabled = false;
  };
  img.src = imageSrc;
}

function downloadImage() {
  const dataURL = canvas.toDataURL("image/png");
  const blob = dataURLtoBlob(dataURL);
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "panda-badge.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function dataURLtoBlob(dataURL) {
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type: mimeString });
}

function particleBurst(x, y) {
  for (let i = 0; i < 24; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    document.body.appendChild(particle);

    const angle = Math.random() * 2 * Math.PI;
    const radius = 100 + Math.random() * 50;

    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty('--x', `${Math.cos(angle) * radius}px`);
    particle.style.setProperty('--y', `${Math.sin(angle) * radius}px`);

    setTimeout(() => particle.remove(), 800);
  }
}

document.getElementById("shareXBtn").addEventListener("click", () => {
  alert("To share your badge on X (Twitter):\n\n1. Click 'Download Image'\n2. Then upload the image in the X post window that’s about to open.\n3. Tag @PandaMania_NFT & @AbstractChain then share the $PANDA love! 🐼");

  const tweetText = encodeURIComponent("Just earned some $PANDA in a raid 🐼 and flexin’ my badge like bamboo bling 💚 This badge slaps harder than a kung fu panda. Raid. Earn. Repeat. Not financial advice… but #BuyPandaBeHappy #PandaFam #AbstractChain #Flipsuite #RaidToEarn");
  const projectURL = encodeURIComponent("");
  const twitterURL = `https://twitter.com/intent/tweet?text=${tweetText}&url=${projectURL}`;
  window.open(twitterURL, "_blank");
});

document.getElementById("shareDiscordBtn").addEventListener("click", () => {
  alert("To share on Discord:\n\n1. Click 'Download Image'\n2. Open any Discord chat\n3. Upload the image and share your badge! 🐼");
});

document.getElementById("generateBtn").addEventListener("click", generateBadge);
document.getElementById("downloadBtn").addEventListener("click", downloadImage);