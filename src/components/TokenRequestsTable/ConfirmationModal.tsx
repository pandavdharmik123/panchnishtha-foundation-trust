'use client';

import { useRef } from "react";
import { Button, Modal } from "antd";
import Image from "next/image";
import { isEmpty } from "lodash";
import { documentOptions, formatDate } from "@/lib/commonFunction";
import { TokenRequest } from "@/redux/slices/tokens";
import { useReactToPrint } from "react-to-print";
import { PrinterOutlined } from "@ant-design/icons";

interface PropsInterface {
  confirmationModal: boolean;
  setConfirmationModal: (arg: boolean) => void;
  tokenDetails: TokenRequest;
  setTokenDetails: (arg: TokenRequest) => void;
}

const TokenConfirmationModal = ({
  confirmationModal,
  setConfirmationModal,
  tokenDetails = {},
  setTokenDetails,
}: PropsInterface) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCancel = () => {
    setConfirmationModal(false);
    setTokenDetails({});
  };

  const getDocumentType = (documentType: string) =>
    documentOptions.find((docType) => docType.value === documentType)?.label || documentType;

  const reactToPrintFn = useReactToPrint({
    contentRef,
  });

  const handlePrintBtn = () => {
    setTimeout(() => {
      reactToPrintFn();
    }, 200);
  }
  return (
    <Modal
      open={confirmationModal}
      className="confirmation-modal"
      title=""
      centered
      footer={false}
      onCancel={handleCancel}
    >
      <div ref={contentRef} className='print-reference'>
        <div className="image-container">
          <Image height={120} width={130} src={'/images/trust_icon.png'} alt="GIF" />
          <span className='trust-name'>પંચનિષ્ઠા ફાઉન્ડેશન ટ્રસ્ટ</span>
        </div>
        {!isEmpty(tokenDetails) && (
          <div className="token-detail">
            <div className='token-detail-header'>
              <span>ટોકન નંબર: {tokenDetails.tokenNumber}/{new Date(tokenDetails?.createdAt as Date).getFullYear()}</span>
              <span>ટોકન તારીખ: {tokenDetails.createdAt && formatDate(tokenDetails.createdAt)}</span>
            </div>
            <span>નામ: {tokenDetails.name}</span>
            <span>ડોક્યુમેન્ટ નો પ્રકાર: {tokenDetails.documentType && getDocumentType(tokenDetails.documentType)}</span>
            <span>રકમ: ₹{tokenDetails.amount} {!tokenDetails.isPaymentDone && tokenDetails.paymentMode === "PENDING" ? '- બાકી' : ''}</span>
            <span>ફોર્મ પરત લેવા નો સમય: {tokenDetails.returnDate && formatDate(tokenDetails.returnDate)} રાત્રે 10:00 થી 11:00 વાગ્યા સુધી </span>
            <span className='footer-text'>ફોર્મ પરત લેવા માટે ટોકન ફરજીયાત સાથે લાવવું.</span>
          </div>
        )}
        <div className='token-info-footer'>
          <span>વધુ માહિતી માટે તમારા મોબઈલ માં આજે જ આ નંબર સેવ કરી લો.</span>
          <span>+91 88 66 41 67 67</span>
        </div>
      </div>
      
      <div className='print-btn-wrapper'>
        <Button 
          type="primary" 
          onClick={handlePrintBtn}
          icon={<PrinterOutlined />}
        >
          Print Token
        </Button>
      </div>
      
    </Modal>
  )
};

export default TokenConfirmationModal;