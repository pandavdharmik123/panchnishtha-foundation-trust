"use client";

import {createExpense, ExpenseRequest, updateExpense} from "@/redux/slices/expenses";
import {AppDispatch, RootState} from "@/redux/store";
import {DatePicker, Form, Input, Modal, notification} from "antd";
import {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import dayjs from "dayjs";
import "./index.scss";
import { Scrollbar } from 'react-scrollbars-custom';
import {isEmpty} from "lodash";

interface CreateExpenseInterface {
  isModalOpen: boolean;
  setIsModalOpen: (arg: boolean) => void;
  setEditData?: (arg: ExpenseRequest) => void;
  isEditMode?: boolean;
  formData?: ExpenseRequest;
}

const CreateExpenseModal = ({
  isModalOpen,
  setIsModalOpen,
  isEditMode = false,
  formData = {},
  setEditData = () => {},
}: CreateExpenseInterface) => {
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

  const { loading } = useSelector((state: RootState) => state.tokens);

  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (isEditMode && !isEmpty(formData) && isModalOpen) {
      form.setFieldsValue({
        ...formData,
        expenseDate: dayjs(formData.expenseDate),
        amount: formData.amount || 0,
      });
    }
  }, [isEditMode, formData, isModalOpen, form]);

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    setEditData({});
  };

  const handleCreateExpense = async () => {
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
      let response: ExpenseRequest = {};

      if (isEditMode && formData?.id) {
        const updateResponse = await dispatch(
          updateExpense({ expenseId: formData.id, data: tokenData }),
        ).unwrap();
        if (updateResponse.updatedExpense) {
          api.success({
            message: "",
            description: updateResponse.message,
          });
          response = updateResponse?.updatedExpense;
        }
      } else {
        response = await dispatch(createExpense(tokenData)).unwrap();
      }
      if (response?.expenseNumber) {
        form.resetFields();
        setIsModalOpen(false);
        setEditData({});
      }
    } catch (e) {
      console.log(e);
      api.error({
        message: "",
        description: "Expense update fail!",
      });
      form.resetFields();
      setIsModalOpen(false);
    }
  };

  return (
    <Modal
      title={isEditMode ? "Update Expense" : "Create Expense"}
      className='create-token-modal'
      open={isModalOpen}
      onClose={handleCancel}
      onCancel={handleCancel}
      onOk={handleCreateExpense}
      okText={isEditMode ? "Update Expense" : "Create Expense"}
      okButtonProps={{
        loading,
      }}
    >
      {contextHolder}
      <Scrollbar style={{ width: 'auto', height: 400 }}>
        <Form form={form} layout="vertical">
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter Description" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: "Enter amount" },
              { pattern: /^\d+$/, message: "Only numeric values are allowed" },
            ]}
          >
            <Input addonBefore="₹"/>
          </Form.Item>

          <div className="div-wrapper">
            <Form.Item
              className="input"
              initialValue={dayjs().add(1, "day")}
              label="Expense Date"
              name="expenseDate"
            >
              <DatePicker className="date-picker" format={"DD/MM/YYYY"} />
            </Form.Item>
          </div>
        </Form>
      </Scrollbar>
    </Modal>
  );
};

export default CreateExpenseModal;