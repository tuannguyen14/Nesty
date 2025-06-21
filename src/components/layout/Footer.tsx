export default function Footer() {
    return (
        <footer className="bg-gradient-to-r from-orange-500 to-orange-600 py-8 mt-12">
            <div className="max-w-7xl mx-auto text-center">
                <p>© {new Date().getFullYear()} Nesty</p>
                <p className="mt-2 text-sm text-gray-600">
                    Liên hệ: hotline@xxxx.com | xxxxxxx
                </p>
            </div>
        </footer>
    )
}
