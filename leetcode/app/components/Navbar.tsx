import Image from 'next/image'
export default function Navbar() {
    return (
        <div className="flex border-b-2 text-black font-bold p-4 items-center space-x-2 h-[10vh]">
            <Image src="/logo1.png" alt="logo" width={50} height={50}></Image>
            <h1>LeetCode Guider</h1>
        </div>
    )
}