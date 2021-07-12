// encrypt-file.js
import * as openpgp from 'openpgp'
import fs from 'fs'

// DO NOT show versions OR comments in output files
// openpgp.config.showVersion = false;
// openpgp.config.showComment = false;
// openpgp.config.allowUnauthenticatedStream = true;
const passphrase =  "super long and hard to guess secret";

(async () => {
  let { privateKeyArmored, publicKeyArmored } =
    await openpgp.generateKey({
      type: "ecc", // Type of the key, defaults to ECC
      curve: "curve25519", // ECC curve name, defaults to curve25519
      userIDs: [{ name: "Jon Smith", email: "jon@example.com" }], // you can pass multiple user IDs
      passphrase: passphrase, // protects the private key
    });

    await encryptFileAndCreateReplacement('test.zip', publicKeyArmored);
    await decryptFileAndCreateReplacement('test-enc.zip', privateKeyArmored);

})();

openpgp.config.allowUnauthenticatedStream = true;


async function encryptFileSym(fileBuffer: Buffer, publicKey: string) {
  const message = await openpgp.createMessage({ binary: fileBuffer });

  const publicKeyRead = await openpgp.readKey({ armoredKey: publicKey })

  return await openpgp.encrypt({
      message: message,
      // signingKeys: privateKey // optional
      encryptionKeys: publicKeyRead,
      armor: false,
  });
}

async function decryptFileSym(fileBuffer: Buffer, privateKey: string) {
  const message = await openpgp.readMessage({ binaryMessage: fileBuffer });

  const privateKeyRead = await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({ armoredKey: privateKey }),
      passphrase
  });

  return await openpgp.decrypt({
      message: message,
      // verificationKeys: publicKey, // optional
      expectSigned: false,
      decryptionKeys: privateKeyRead,
      format: 'binary'
  });
}

async function encryptFileAndCreateReplacement(filename: string, publicKey: string) {
  const newFileName = filename.split('.')[0] + "-enc.zip";

  const oldFileBuff = fs.readFileSync(filename);
  const encryptedData = await encryptFileSym(oldFileBuff, publicKey);
  fs.appendFileSync(newFileName, Buffer.from(encryptedData));
}

async function decryptFileAndCreateReplacement(filename: string, privateKey: string) {
  const newFileName = filename.replace("enc", "dec");

  const oldFileBuff = fs.readFileSync(filename);
  const encryptedData = await decryptFileSym(oldFileBuff, privateKey);
  fs.writeFileSync(newFileName, Buffer.from(encryptedData.data))
}
