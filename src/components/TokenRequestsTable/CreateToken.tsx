"use client";

import {documentOptions} from "@/lib/commonFunction";
import {createToken, TokenRequest, updateToken} from "@/redux/slices/tokens";
import {AppDispatch, RootState} from "@/redux/store";
import {DatePicker, Form, Input, Modal, notification, Select} from "antd";
import {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import dayjs from "dayjs";
import "./index.scss";
import { Scrollbar } from 'react-scrollbars-custom';
import {isEmpty} from "lodash";
import {BaseSelectRef} from "rc-select";

interface CreateTokenInterface {
  setConfirmationModal: (arg: boolean) => void;
  isModalOpen: boolean;
  setIsModalOpen: (arg: boolean) => void;
  setTokenDetails: (arg: TokenRequest) => void;
  setEditData?: (arg: TokenRequest) => void;
  setIsEditMode?: (arg: boolean) => void;
  isEditMode?: boolean;
  formData?: TokenRequest;
}

const CreateTokenModal = ({
  isModalOpen,
  setIsModalOpen,
  setConfirmationModal,
  setTokenDetails,
  isEditMode = false,
  formData = {},
  setEditData = () => {},
  setIsEditMode = () => {}
}: CreateTokenInterface) => {
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [selectedDocument, setSelectedDocument] = useState("");
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const firstInputRef = useRef<BaseSelectRef>(null);

  const { loading } = useSelector((state: RootState) => state.tokens);

  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (isModalOpen && firstInputRef.current) {
      // Wait for the modal to render before focusing
      setTimeout(() => {
          firstInputRef.current?.focus();
      }, 100);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isEditMode && !isEmpty(formData) && isModalOpen) {
      const documentType =
        documentOptions.find((doc) => doc.value === formData.documentType)?.value || "other";
      form.setFieldsValue({
        ...formData,
        returnDate: dayjs(formData.returnDate),
        paymentMode: formData.paymentMode || "CASH",
        amount: formData.amount || 0,
        documentType: documentType,
        otherDocumentType: formData.documentType === "other" ? "" : formData.documentType,
      });
      setSelectedDocument(documentType);
    }
  }, [isEditMode, formData, isModalOpen, form]);

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setEditData({});
    setIsEditMode(false);
  };

  const handleCreateToken = async () => {
    try {
      const values = await form.validateFields();
      const tokenData = {
        ...values,
        documentType:
          values.documentType !== "other" ? values.documentType : values.otherDocumentType,
        userId: localStorage.getItem("userId"),
        amount: Number(values.amount) || 0,
        returnDate: new Date(values.returnDate),
      };
      let response: TokenRequest = {};

      if (isEditMode && formData?.id) {
        const updateResponse = await dispatch(
          updateToken({ tokenId: formData.id, data: tokenData }),
        ).unwrap();
        if (updateResponse.updatedToken) {
          api.success({
            message: "",
            description: updateResponse.message,
          });
          response = updateResponse?.updatedToken;
        }
      } else {
        response = await dispatch(createToken(tokenData)).unwrap();
      }
      if (response?.tokenNumber) {
        form.resetFields();
        setIsModalOpen(false);
        setTokenDetails(response);
        setEditData({});
        setConfirmationModal(true);
      }
    } catch (e) {
      console.log(e);
      // api.error({
      //   message: "",
      //   description: "Token update fail!",
      // });
      // form.resetFields();
      // setIsModalOpen(false);
    }
  };

  return (
    <Modal
      title={isEditMode ? "Update Token" : "Create Token"}
      className='create-token-modal'
      open={isModalOpen}
      onClose={handleCancel}
      onCancel={handleCancel}
      onOk={handleCreateToken}
      okText={isEditMode ? "Update Token" : "Create Token"}
      okButtonProps={{
        loading,
      }}
    >
      {contextHolder}
      <Scrollbar style={{ width: 'auto', height: 400 }}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="documentType"
            label="Document Type"
            rules={[{ required: true, message: "Please select a document type" }]}
          >
            <Select
              ref={firstInputRef}
              placeholder="Select Document Type"
              onChange={(value) => {
                setSelectedDocument(value);
                const paymentMode = form.getFieldValue("paymentMode");
                form.setFieldsValue({
                  amount:
                    paymentMode === "FREE"
                      ? 0
                      : documentOptions.find((doc) => doc.value === value)?.amount || 0,
                });
              }}
              allowClear
            >
              {documentOptions.map((document) => {
                return (
                  <Select.Option key={document.value} value={document.value}>
                    {document.label}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>

          {selectedDocument === "other" && (
            <Form.Item
              name="otherDocumentType"
              label="Specify Document Type"
              rules={[{ required: true, message: "Please enter document type" }]}
            >
              <Input placeholder="Enter document type" />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="mobileNumber"
            label="Mobile Number"
            rules={[
              { required: true, message: "Enter mobile number" },
              { pattern: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit mobile number" },
            ]}
          >
            <Input
              type="tel"
              addonBefore="+91"
              maxLength={10}
              placeholder="Enter 10-digit mobile number"
              onKeyPress={(event) => {
                if (!/^\d$/.test(event.key)) {
                  event.preventDefault();
                }
              }}
              onChange={(event) => {
                event.target.value = event.target.value.replace(/\D/g, "");
              }}
            />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount"
            initialValue={0}
            rules={[
              {
                validator: (_, value) => {
                  const paymentMode = form.getFieldValue('paymentMode');
                  if (paymentMode !== 'FREE' && (!value || Number(value) <= 0)) {
                    return Promise.reject(new Error('Enter amount'));
                  }
                  return Promise.resolve();
                },
              },
              { pattern: /^\d+$/, message: "Only numeric values are allowed" },
            ]}
          >
            <Input addonBefore="₹" disabled={selectedDocument !== "other"} />
          </Form.Item>

          <div className="div-wrapper">
            <Form.Item className="input" label="Payment Mode" name="paymentMode" initialValue="CASH">
              <Select
                value={paymentMode}
                onChange={(value) => {
                  setPaymentMode(value);
                  if (value === "FREE") {
                    form.setFieldsValue({ amount: 0 });
                  } else {
                    const documentType = form.getFieldValue("documentType");
                    form.setFieldsValue({
                      amount: documentOptions.find((doc) => doc.value === documentType)?.amount || 0,
                    });
                  }
                }}
              >
                <Select.Option value="ONLINE">Online</Select.Option>
                <Select.Option value="CASH">Cash</Select.Option>
                <Select.Option value="FREE">Free</Select.Option>
                <Select.Option value="PENDING">Pending</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              className="input"
              initialValue={dayjs().add(1, "day")}
              label="Return Date"
              name="returnDate"
            >
              <DatePicker className="date-picker" format={"DD/MM/YYYY"} />
            </Form.Item>
          </div>
        </Form>
      </Scrollbar>
    </Modal>
  );
};

export default CreateTokenModal;