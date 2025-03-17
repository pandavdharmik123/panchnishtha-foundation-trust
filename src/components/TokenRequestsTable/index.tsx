"use client"; // Required for Next.js App Router if using hooks

import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Table, Input, Button, Modal, Form, Select, Radio, DatePicker, DatePickerProps, notification } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import './index.scss';
import { documentOptions } from "@/lib/commonFunction";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { TokenRequest as TokenInput, updateToken } from "@/redux/slices/tokens";
import paymentDoneImage from '@/assets/payment-done.png'
import returnDoneImage from '@/assets/return-done.png'
import Image from "next/image";
import CreateTokenModal from "./CreateToken";
import TokenConfimrationModal from "./ConfirmationModal";

const { Option } = Select;

// Define the required types
export interface User {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
}

export enum PaymentMode {
  CASH = "CASH",
  CARD = "CARD",
  ONLINE = "ONLINE",
}

export interface TokenRequest {
  id: string;
  tokenNumber: number;
  name: string;
  documentType: string;
  mobileNumber: string;
  isPaymentDone: boolean;
  paymentMode: PaymentMode;
  isReturn: boolean;
  userId: string;
  userDetail: User;
  createdAt: Date;
}

const TokenRequestTable = ({ tokenRequests }: any) => {
  const [data, setData] = useState<TokenRequest[]>([]);
  const [filteredData, setFilteredData] = useState<TokenRequest[]>([]);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [tokenDetails, setTokenDetails] = useState<TokenInput>({});
  const { loading, error } = useSelector((state: RootState) => state.tokens);

  const dispatch: AppDispatch = useDispatch();

  // Fetch data from API
  useEffect(() => {
    setData(tokenRequests);
    setFilteredData(tokenRequests);    
  }, [tokenRequests]);

  // Search function
  const handleSearch = (value: string) => {
    setSearchText(value);
    const filtered = data.filter(
      (item) =>
        String(item.tokenNumber).includes(value) ||
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.documentType.toLowerCase().includes(value.toLowerCase()) ||
        item.mobileNumber.includes(value) ||
        item.userDetail.email.toLowerCase().includes(value.toLowerCase()) ||
        item.paymentMode.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const showModal = () => setIsModalOpen(true);

  // Close modal
  
  const handlePaymentDone = async (tokenId: string) => {
    if (tokenId) {
      await dispatch(updateToken({ tokenId, data: { isPaymentDone: true } })).unwrap();
    }
  }

  const handleReturnDone = async (tokenId: string) => {
    if (tokenId) {
      await dispatch(updateToken({ tokenId, data: { isReturn: true } })).unwrap();
    }
  }

  // Table columns
  const columns: ColumnsType<TokenRequest> = [
    {
      title: "Token No.",
      dataIndex: "tokenNumber",
      key: "tokenNumber",
      align: 'center',
      width: 100,
      fixed: true,
      sorter: (a, b) => a.tokenNumber - b.tokenNumber,
    },
    {
      title: "Token Date",
      dataIndex: "createdAt",
      align: 'center',
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),      
    },
    {
      title: "Name",
      dataIndex: "name",
      align: 'center',
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    
    {
      title: "Document Type",
      align: 'center',
      dataIndex: "documentType",
      key: "documentType",
      render: (documentType) => documentOptions.find(docType => docType.value === documentType)?.label || documentType,
    },
    {
      title: "Mobile Number",
      align: 'center',
      dataIndex: "mobileNumber",
      key: "mobileNumber",
    },
    {
      title: "User",
      align: 'center',
      dataIndex: ["userDetail", "name"],
      key: "userDetail",
      render: (_, record) => record.userDetail?.email.replace('@pannishthafoundation.com', '') || "N/A",
    },
    {
      title: "Payment Mode",
      dataIndex: "paymentMode",
      align: 'center',
      width: 150,
      key: "paymentMode",
      filters: [
        { text: "Cash", value: "CASH" },
        { text: "Online", value: "ONLINE" },
      ],
      onFilter: (value, record) => record.paymentMode === value,
    },
    {
      title: "Payment (જમા)",
      align: 'center',
      dataIndex: "isPaymentDone",
      fixed: 'right',
      key: "isPaymentDone",
      width: 120,
      render: (isPaymentDone, record) => (isPaymentDone 
        ? <Image alt='payment-done' src={paymentDoneImage} height={32} width={32} />
        : <Button className='payment-done-btn' onClick={() => handlePaymentDone(record.id)}>જમા</Button>),
    },
    {
      title: "Document Return",
      align: 'center',
      dataIndex: "isReturn",
      key: "isReturn",
      fixed: 'right',
      width: 100,
      render: (isReturn, record) => (isReturn 
        ? <Image alt='payment-done' src={returnDoneImage} height={32} width={32} />
        : <Button type="primary" danger onClick={() => handleReturnDone(record.id)}>Return</Button>),
    },
    
  ];

  const onChange: DatePickerProps['onChange'] = (_, dateString) => {
    if(dateString) {
      const filtered = data.filter(
        (item) => {
          const selectedDate = new Date(item.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
  
          return selectedDate === dateString;
        }
          
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
    
  };

  return (
    <div className='tokens-table-container'>
      <div className='search-bar-continer' style={{ margin: '16px auto' }}>
        <Input
          className='search-bar'
          placeholder="Search by Name, Document Type, Mobile, User, or Payment Mode"
          value={searchText}
          suffix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
        />

        <DatePicker className='date-picker' onChange={onChange} format={'DD/MM/YYYY'} />

        <Button className='create-btn' type="primary" icon={<PlusOutlined />} onClick={showModal}>
          Create Token
        </Button>
      </div>
      
      <Table
        loading={loading}
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: filteredData.length || 10 }}
        rowKey="id"
        scroll={{
          x: 'max-content',
          y: 'calc(100vh - 250px)',
        }}
      />

      <CreateTokenModal 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen} 
        confirmationModal={confirmationModal} 
        setConfirmationModal={setConfirmationModal}
        setTokenDetails={setTokenDetails}
       />
      <TokenConfimrationModal 
        confirmationModal={confirmationModal}
        setConfirmationModal={setConfirmationModal}
        tokenDetails={tokenDetails}
        setTokenDetails={setTokenDetails}
      />
    </div>
  );
};

export default TokenRequestTable;
