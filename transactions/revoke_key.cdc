transaction() {
    prepare(signer: AuthAccount) {
        let targetKey: UInt8 = // Fill in the first byte of the target key
        let keyIndex = // Fill in the index of the key to revoke

        let key = signer.keys.get(keyIndex: keyIndex) ?? panic("missing key")
        
        if key.publicKey.publicKey[0] != targetKey {
          panic("Wrong key")
        }

        signer.keys.revoke(keyIndex: keyIndex)
    }
}