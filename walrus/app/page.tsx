import SecureFileVault from "@/components/SecureFileVault";

export default function Home() {
    return (
        <main className="min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient">
                        DeTransfer
                    </h1>
                    <p className="text-xl text-gray-300 mb-2">
                        Decentralized File Storage on Walrus
                    </p>
                    <p className="text-sm text-gray-400">
                        Secure, permanent, and censorship-resistant file storage
                    </p>
                </div>

                {/* Main Content */}
                <div className="animate-slide-up">
                    <SecureFileVault />
                </div>

                {/* Footer */}
                <div className="mt-16 text-center text-gray-400 text-sm">
                    <p>Powered by Walrus Testnet • Built on Sui Blockchain</p>
                </div>
            </div>
        </main>
    );
}
