import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

console.log(ethers)

async function connect() {
    if (typeof window.ethereum != "undefined") {
        console.log("I see a metamask")
        await window.ethereum.request({ method: "eth_requestAccounts" })
        console.log("We're connected")
        connectButton.innerHTML = "Connected"
    } else {
        console.log("I don't see a metamask")
        connectButton.innerHTML = "Please, install Metamask..."
    }
}
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with: ${ethAmount} ETH`)
    if (typeof window.ethereum !== "undefined") {
        //provider / connection with the blockchain
        //signer / wallet / Someone with gas
        //A contract to interact with (its ABI & Address)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        console.log(provider)
        const signer = provider.getSigner()
        console.log(signer)
        console.log(`Contract Address: ${contractAddress}`)
        const signerAddress = await signer.getAddress()
        console.log(`Signer Address: ${signerAddress}`)
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!!!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}
async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = await new ethers.providers.Web3Provider(
            window.ethereum
        )
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}
async function withdraw() {
    console.log("Withdrawing...")
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        //const signerAddress = await signer.getAddress()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!!!")
        } catch (error) {
            console.log(error)
        }
    }
}
