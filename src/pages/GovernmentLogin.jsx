const GovernmentLogin = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">

            <h1 className="text-3xl font-bold mb-8">
                Government Login
            </h1>

            <div className="w-full max-w-md bg-white/5 p-8 rounded-xl border border-white/10">

                <input
                    type="email"
                    placeholder="Official Email"
                    className="w-full mb-4 px-4 py-3 bg-black/30 border border-white/10 rounded-lg focus:outline-none"
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-6 px-4 py-3 bg-black/30 border border-white/10 rounded-lg focus:outline-none"
                />

                <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition">
                    Login
                </button>

            </div>

        </div>
    );
};

export default GovernmentLogin;
