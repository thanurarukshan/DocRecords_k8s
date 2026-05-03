#!/bin/bash
# Import all DocRecords service images into K3s containerd
# Run with: sudo bash k8s/import-images.sh

K8S_DIR="$(dirname "$0")"

IMAGES=(
  "api-gateway.tar"
  "auth-service.tar"
  "patient-service.tar"
  "prescription-service.tar"
  "profile-control-service.tar"
  "frontend.tar"
)

echo "===================================="
echo " Importing DocRecords images into K3s"
echo "===================================="

for img in "${IMAGES[@]}"; do
  TAR_PATH="$K8S_DIR/$img"
  if [ -f "$TAR_PATH" ]; then
    echo ""
    echo ">>> Importing: $img ..."
    k3s ctr images import "$TAR_PATH"
    echo "    Done: $img"
  else
    echo "    WARNING: $TAR_PATH not found — skipping"
  fi
done

echo ""
echo "===================================="
echo " All imports complete. Verifying..."
echo "===================================="
k3s ctr images list | grep "docrecords"
