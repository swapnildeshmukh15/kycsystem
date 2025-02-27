const express = require("express");
const router = express.Router();
const {
	addUserData,
	verifyUser,
	checkPoliceKey,
	getData,
	changeUserKey,
} = require("./kycClient");
const fetch = require("node-fetch");
const {
	getUserPublicKey,
	getUserAddress,
	decrypt,
} = require("./lib/transaction");

/* GET home page. */
router.get("/", (req, res, next) => {
	res.render("home");
});
/* GET user page. */
router.get("/user", (req, res, next) => {
	res.render("user", { name: "User" });
});

/* GET user User form page. */
router.get("/userPageAllowEdit", (req, res, next) => {
	res.render("userPage1");
});
router.get("/userPageDenyEdit", (req, res, next) => {
	res.render("userPage2");
});
router.get("/userform", (req, res, next) => {
	res.render("userform");
});
router.post("/userData", (req, res, next) => {
	try {
		const Key = req.body.privateKey;
		const pub_key = req.body.pub_key;
		const id = req.body.id;
		const fromNumber = req.body.fromNumber;
		const toNumber = req.body.toNumber;
		const quantity = req.body.quantity;
		const organisationID = req.body.organisationID;
		const isActive = req.body.isActive;
		const createdDate = req.body.createdDate;
		const wareHouseID = req.body.wareHouseID;
		const prefix = req.body.prefix;
		const enKey = req.body.enKey;

		console.log("Data sent to REST API");
		addUserData(
			Key,
			pub_key,
			id,
			fromNumber,
			toNumber,
			quantity,
			organisationID,
			isActive,
			createdDate,
			wareHouseID,
			prefix,
			enKey,
		);
		res.send({ message: "Data successfully added" });
	} catch (error) {
		console.log(error);
	}
});
/* GET client page. */
router.get("/client", (req, res, next) => {
	res.render("client", { name: "Client" });
});
router.get("/ClientUi", (req, res, next) => {
	res.render("clientUi", { name: "Client" });
});

router.post("/getKeyAndAddress", (req, res) => {
	console.log("indesssssss");
	let PublicKey = getUserPublicKey(req.body.privateKey);
	let address = getUserAddress(PublicKey);
	res.send({ address: address, pub_key: PublicKey });
});
router.post("/changeEnckey", async (req, res) => {
	const privateKey = req.body.priv_key;
	const oldKey = req.body.oldKey;
	const newKey = req.body.newKey;
	const msg = await changeUserKey(privateKey, oldKey, newKey);
	res.send({ msg: msg });
});
router.post("/getAddressFromPubKey", (req, res) => {
	let PublicKey = req.body.pub_key;
	let address = getUserAddress(PublicKey);
	res.send({ address: address });
});
/* GET police page. */
router.get("/police", (req, res, next) => {
	res.render("police", { name: "Police" });
});
router.get("/policeUi", async (req, res) => {
	console.log("P UI")
	let usersList = await getData();
	let users = [];
	for (let index = 0; index < usersList.length; index++) {
		const user = usersList[index];
		users.push(user);
	}
	console.log("INSIDE POLICE UI ", users)
	res.render("policeUi", { listings: users });
});
router.post("/checkPoliceKey", (req, res) => {
	let key = req.body.privateKey;
	let status = checkPoliceKey(key);
	console.log("STATUS IS ", status + "key", key)
	res.send({ status: status });
});
router.post("/putStatus", (req, res) => {
	console.log("in putstats police")
	const uPub_key = req.body.pub_key;
	const status = req.body.status;
	const privateKey = req.body.privateKey;
	const alert = verifyUser(privateKey, uPub_key, status);
	res.send({ alert: alert })
});
router.post("/decryptData", (req, res) => {
	let dataToDecrypt = req.body.result;
	const deKey = req.body.deKey;
	let BufferData = Buffer.from(dataToDecrypt, "base64").toString("ascii");
	console.log("Buffer Data data to decrypt is ", JSON.parse(BufferData)[0]);
	let extraPayload = JSON.parse(BufferData)[1]
	console.log("extraPayload  is ", extraPayload);
	console.log("dec Key", deKey);
	let decryptedData = decrypt(JSON.parse(BufferData)[0], deKey);
	console.log("decrypted Data", decryptedData);
	decryptedData = JSON.parse(decryptedData);
	res.send({ user: decryptedData, status: extraPayload });
});

router.post("/VerifyData", (req, res) => {
	console.log("inside verify data");
	let data = req.body.result;
	let BufferData = Buffer.from(data, "base64").toString("ascii");
	data = JSON.parse(BufferData);
	data = data[1];
	console.log("DAATA{1] inside verify ", data[1])
	res.send({ status: data });
});

router.post("/getKey", (req, res, next) => {
	key = req.body.privateKey;
	key = getUserPublicKey(key);
	res.send({ publicKey: key });
});
router.get("/statedata", async (req, res, next) => {
	try {
		let geturl = "http://rest-api:8008/state/" + req.query.address;
		let response = await fetch(geturl, {
			method: "GET",
		});
		let responseJson = await response.json();
		let data = responseJson.data;
		res.send(data);
	} catch (error) {
		res.status(500);
		res.send(error);
	}
});
module.exports = router;