module.exports = {
    getGigapanTileNumber(gid) {
        gid = Math.floor(gid / 1E3);
        return (10 > gid ? "0" : "") + gid
    }
}
