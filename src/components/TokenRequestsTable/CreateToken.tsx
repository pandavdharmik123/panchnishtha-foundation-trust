'use client';

import { documentOptions } from "@/lib/commonFunction";
import { createToken } from "@/redux/slices/tokens";
import { AppDispatch } from "@/redux/store";
import { Input, Modal, Form, Select } from "antd";
import { useState } from "react";
import { useDispatch } from "react-redux";


const CreateTokenModal = ({ 
  isModalOpen,
  setIsModalOpen,
  setConfirmationModal,
  setTokenDetails
}: any) => {

  const [paymentMode, setPaymentMode] = useState("CASH");
  const [form] = Form.useForm();
  const [selectedDocument, setSelectedDocument] = useState("");

  const dispatch: AppDispatch = useDispatch();

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false)
  };

  const handleCreateToken = async () => {
    try {
      const values = await form.validateFields();
      const tokenData = {
        ...values,
        documentType: values.documentType !== 'other' ? values.documentType : values.otherDocumentType,
        userId: localStorage.getItem("userId"),
        amount: Number(values.amount) || 0
      };
      console.log('tokenData', tokenData);
      const response: any = await dispatch(createToken(tokenData)).unwrap();
      if(response.tokenNumber) {
        form.resetFields();
        setIsModalOpen(false);
        setTokenDetails(response);
        setConfirmationModal(true);
      }
    } catch(error) {
      form.resetFields();
      setIsModalOpen(false);
    }
      
  };
  

  return (
    <Modal
        title="Create New Token"
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleCreateToken}
        okText="Create"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="documentType"
            label="Document Type"
            rules={[{ required: true, message: "Please select a document type" }]}
          >
            <Select
              placeholder="Select Document Type"
              onChange={(value) => {
                setSelectedDocument(value);
                form.setFieldsValue({ amount: documentOptions.find(doc => doc.value === value)?.amount || 0 });
              }}
              allowClear
            >
              {documentOptions.map((document: any) => {
                return (
                  <Select.Option 
                  key={document.value} 
                  value={document.value}
                  >
                    {document.label}
                  </Select.Option>
                )
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
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter name" }]}>
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
                  event.preventDefault(); // Prevent non-numeric characters
                }
              }}
              onChange={(event) => {
                const numericValue = event.target.value.replace(/\D/g, ""); // Remove non-numeric characters
                event.target.value = numericValue; // Ensure only numbers are entered
              }}
            />
          </Form.Item>
          <Form.Item 
            name="amount" 
            label="Amount"
            rules={[
              { required: true, message: "Enter amount" },
              { pattern: /^\d+$/, message: "Only numeric values are allowed" }
            ]}
          >
            <Input
              addonBefore="₹"
              disabled={selectedDocument !== 'other'}
            />
          </Form.Item>

          <Form.Item label="Payment Mode" name="paymentMode" initialValue="CASH">
            <Select value={paymentMode} onChange={(value) => setPaymentMode(value)}>
              <Select.Option value="ONLINE">Online</Select.Option>
              <Select.Option value="CASH">Cash</Select.Option>
            </Select>
          </Form.Item>
        </Form>
    </Modal>
  )
};

export default CreateTokenModal;