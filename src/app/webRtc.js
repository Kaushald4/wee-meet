class WebRtc {
    mySocketId = null;
    remoteSocketId = null;
    chanel = undefined;

    constructor() {
        this.peer = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
                { urls: "stun:stun2.l.google.com:19302" },
            ],
        });
        this.chanel = this.peer.createDataChannel(`chat-${Date.now()}}`);
    }

    init = (remoteSocketId, mySocketId) => {
        this.remoteSocketId = remoteSocketId;
        this.mySocketId = mySocketId;
    };

    createOffer = async () => {
        const offer = await this.peer.createOffer();
        await this.peer.setLocalDescription(offer);
        return offer;
    };

    createAnswer = async (offer) => {
        await this.peer.setRemoteDescription(offer);
        const answer = await this.peer.createAnswer();
        await this.peer.setLocalDescription(answer);
        return answer;
    };

    setRemoteAnswer = async (answer) => {
        await this.peer.setRemoteDescription(answer);
    };
}

export default new WebRtc();
