'use client';

import { Modal } from "antd";
import Image from "next/image";
import checkGIF from '@/assets/available-worldwide.gif';
import './index.scss';
import { isEmpty } from "lodash";
import { documentOptions } from "@/lib/commonFunction";
import { TokenRequest } from "@/redux/slices/tokens";

interface PropsInterface {
  confirmationModal: boolean;
  setConfirmationModal: (arg: boolean) => void;
  tokenDetails: TokenRequest;
  setTokenDetails: (arg: TokenRequest)=> void;
}

const TokenConfimrationModal = ({
  confirmationModal,
  setConfirmationModal,
  tokenDetails = {},
  setTokenDetails
}: PropsInterface) => {

  const handleCancel = () => {
    setConfirmationModal(false);
    setTokenDetails({});
  };

  const getDocumentType = (documentType: string) => 
    documentOptions.find(docType => docType.value === documentType)?.label || documentType;
  return (
    <Modal
      open={confirmationModal}
      className="confirmation-modal"
      title=""
      centered
      footer={false}
      onCancel={handleCancel}
    >
      <div className='image-container'>
        <Image height={150} width={150} src={checkGIF} alt="GIF" />
        <span className="success-message">Token Created Successfully!</span>
      </div>
      {!isEmpty(tokenDetails) && (
        <>
          <div className='token-detail'>
            <span>Token Number: {tokenDetails.tokenNumber}</span>
            <span>Name: {tokenDetails.name}</span>
            <span>Document Type: { tokenDetails.documentType && getDocumentType(tokenDetails.documentType)}</span>
          </div>
        </>
      )}
    </Modal>
  )
};

export default TokenConfimrationModal;