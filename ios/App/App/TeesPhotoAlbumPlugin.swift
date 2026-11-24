import Foundation
import Photos
import Capacitor

@objc(TeesPhotoAlbumPlugin)
public class TeesPhotoAlbumPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TeesPhotoAlbumPlugin"
    public let jsName = "TeesPhotoAlbum"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "saveToAlbum", returnType: CAPPluginReturnPromise)
    ]

    @objc func saveToAlbum(_ call: CAPPluginCall) {
        guard let base64 = call.getString("base64"),
              let imageData = Data(base64Encoded: base64, options: .ignoreUnknownCharacters) else {
            call.reject("Invalid base64 image data")
            return
        }

        let albumName = call.getString("albumName") ?? "Tee's Film Lab"
        let rawFilename = call.getString("filename") ?? "tees-lab-\(Int(Date().timeIntervalSince1970)).jpg"
        let safeFilename = (rawFilename as NSString).lastPathComponent

        PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
            guard status == .authorized || status == .limited else {
                call.reject("Photos library permission denied")
                return
            }

            let tmpDir = FileManager.default.temporaryDirectory
            let tmpURL = tmpDir.appendingPathComponent(UUID().uuidString + "_" + safeFilename)

            do {
                try imageData.write(to: tmpURL, options: .atomic)
            } catch {
                call.reject("Failed to write temporary image file: \(error.localizedDescription)")
                return
            }

            let fetchOptions = PHFetchOptions()
            fetchOptions.predicate = NSPredicate(format: "title = %@", albumName)
            let existingAlbums = PHAssetCollection.fetchAssetCollections(with: .album, subtype: .albumRegular, options: fetchOptions)
            let existingAlbum = existingAlbums.firstObject

            PHPhotoLibrary.shared().performChanges({
                let assetRequest = PHAssetCreationRequest.forAsset()
                assetRequest.addResource(with: .photo, fileURL: tmpURL, options: nil)
                guard let assetPlaceholder = assetRequest.placeholderForCreatedAsset else { return }

                if let album = existingAlbum {
                    let albumChangeRequest = PHAssetCollectionChangeRequest(for: album)
                    albumChangeRequest?.addAssets([assetPlaceholder] as NSFastEnumeration)
                } else {
                    let createAlbumRequest = PHAssetCollectionChangeRequest.creationRequestForAssetCollection(withTitle: albumName)
                    createAlbumRequest.addAssets([assetPlaceholder] as NSFastEnumeration)
                }
            }) { success, error in
                try? FileManager.default.removeItem(at: tmpURL)
                if success {
                    call.resolve([
                        "saved": true,
                        "albumName": albumName
                    ])
                } else {
                    call.reject(error?.localizedDescription ?? "Failed to save photo to album")
                }
            }
        }
    }
}
