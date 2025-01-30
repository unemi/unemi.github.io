self.onmessage = (msg)=>{
	console.log("W:",msg);
	fetch("http://www.intlab.soka.ac.jp/").then((r)=>r.text())
	.then((str)=>{console.log(str);
	self.postMessage("This is a message from the worker.");
	}).catch((r)=>{alert(r)});
	
}
