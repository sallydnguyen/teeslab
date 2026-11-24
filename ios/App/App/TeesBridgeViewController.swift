import UIKit
import Capacitor

class TeesBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(TeesPhotoAlbumPlugin())
    }
}
