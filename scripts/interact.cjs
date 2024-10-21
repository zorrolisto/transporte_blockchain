const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    
    const fileStorageAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
    const FileStorage = await ethers.getContractFactory("FileStorage");
    const fileStorage = FileStorage.attach(fileStorageAddress);

    // Agregar un archivo
    const fileName = "example.txt";
    const fileHash = "QmExampleHash"; // Reemplaza con el hash real
    console.log(`Adding file: ${fileName} with hash: ${fileHash}`);
    const tx = await fileStorage.addFile(fileName, fileHash);
    await tx.wait();
    console.log("File added!");

    // Obtener el hash del archivo
    const retrievedHash = await fileStorage.getFileHash(fileName);
    console.log(`Retrieved hash for ${fileName}: ${retrievedHash}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
