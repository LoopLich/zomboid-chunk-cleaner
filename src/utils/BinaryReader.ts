export class BinaryReader {
    private _byteOffset: number;
    private _dataView: DataView;
    private _markedByteOffset?: number;

    constructor(buffer: ArrayBuffer) {
        this._dataView = new DataView(buffer);
        this._byteOffset = 0;
    }

    public get position(): number {
        return this._byteOffset;
    }

    private _checkBounds(bytesToRead: number): void {
        const remaining = this._dataView.byteLength - this._byteOffset;
        if (remaining < bytesToRead) {
            throw new RangeError(
                `Cannot read ${bytesToRead} bytes at offset ${this._byteOffset}: only ${remaining} bytes remaining`
            );
        }
    }

    public mark(): void {
        this._markedByteOffset = this._byteOffset;
    }

    public readBytes(count: number): number[] {
        const elements: number[] = [];
        for (let i = 0; i < count; i++) {
            elements.push(this.readInt8());
        }
        return elements;
    }

    public readFloat32(): number {
        this._checkBounds(4);
        const value = this._dataView.getFloat32(this._byteOffset);
        this._byteOffset += 4;
        return value;
    }

    public readInt16(): number {
        this._checkBounds(2);
        const value = this._dataView.getInt16(this._byteOffset);
        this._byteOffset += 2;
        return value;
    }

    public readInt32(): number {
        this._checkBounds(4);
        const value = this._dataView.getInt32(this._byteOffset);
        this._byteOffset += 4;
        return value;
    }

    public readInt8(): number {
        this._checkBounds(1);
        return this._dataView.getInt8(this._byteOffset++);
    }

    public readInt8Array(count: number): Int8Array {
        return new Int8Array(this.readBytes(count));
    }

    public readString(length?: number): string {
        if (length == null) {
            length = this.readInt16();
        }

        const string = this.readBytes(length)
            .map((byte) => String.fromCharCode(byte))
            .join('');

        const index = string.indexOf('\0');

        return index > -1 ? string.slice(0, index) : string;
    }

    public readUint8(): number {
        this._checkBounds(1);
        return this._dataView.getUint8(this._byteOffset++);
    }

    public reset(): void {
        if (this._markedByteOffset) {
            this._byteOffset = this._markedByteOffset;
            delete this._markedByteOffset;
        } else {
            this._byteOffset = 0;
        }
    }

    public skipBytes(count: number): void {
        this._checkBounds(count);
        this._byteOffset += count;
    }
}
