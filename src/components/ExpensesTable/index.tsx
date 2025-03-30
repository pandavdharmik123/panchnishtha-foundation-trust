"use client"; // Required for Next.js App Router if using hooks

import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import {Table, Input, Button, DatePicker, DatePickerProps, Tooltip, notification} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import './index.scss';
import { exportToExcel, formatDate } from "@/lib/commonFunction";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import {deleteExpense, ExpenseRequest as ExpenseInput, ExpenseRequest} from "@/redux/slices/expenses";
// import editIcon from '@/assets/edit-icon.png'
import deleteIcon from '@/assets/delete-icon.png'
import excelIcon from '@/assets/export-excel-icon.png'
import Image from "next/image";
import CreateExpenseModal from "./CreateExpense";
// import ExpenseConfirmationModal from "./ConfirmationModal";
import { isEmpty, sortBy } from "lodash";


const ExpensesTable = ({ expensesData }: { expensesData: ExpenseRequest[] }) => {
    const [data, setData] = useState<ExpenseRequest[]>([]);
    const [filteredData, setFilteredData] = useState<ExpenseRequest[]>([]);
    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [confirmationModal, setConfirmationModal] = useState(false);
    // const [tokenDetails, setExpenseDetails] = useState<ExpenseInput>({});
    // const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [editData, setEditData] = useState<ExpenseInput>({})
    const { expenses, loading } = useSelector((state: RootState) => state.expenses);
    const [api, contextHolder] = notification.useNotification();

    const dispatch: AppDispatch = useDispatch();

    // Fetch data from API
    useEffect(() => {
        setData(expensesData);
        setFilteredData(expensesData);
    }, [expensesData]);

    // Search function
    const handleSearch = (value: string) => {
        setSearchText(value);
        const filtered = data.filter(
            (item) =>
                String(item.expenseNumber).includes(value) ||
                item.description?.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredData(filtered);
    };

    const showModal = () => setIsModalOpen(true);

    const handleDeleteExpense = async (expenseId: string) => {
        const response = await dispatch(deleteExpense(expenseId)).unwrap();
        if(response.expenseId) {
            api.success({
                message: '',
                description: response.message,
            })
        }
    }

    const handleActionClick = async (tokenData: ExpenseRequest, type: string) => {
        switch(type) {
            // case 'view_detail':
            //     setExpenseDetails(tokenData);
            //     setConfirmationModal(true);
            //     break;

            // case 'edit_icon':
            //     setEditData(tokenData);
            //     setIsEditMode(true);
            //     setIsModalOpen(true);
            //     break;
            case 'delete_icon':
                if(tokenData.id) {
                    await handleDeleteExpense(tokenData.id);
                }
                break;
            default:
                return;
        }
    }

    // Table columns
    const columns: ColumnsType<ExpenseRequest> = [
        {
            title: "Expense No.",
            dataIndex: "expenseNumber",
            key: "expenseNumber",
            align: 'center',
            width: 130,
            fixed: true,
            sorter: (a, b) => (a.expenseNumber as number) - (b.expenseNumber as number),
        },
        {
            title: "Expense Date",
            dataIndex: "expenseDate",
            align: 'center',
            key: "expenseDate",
            render: (date) => formatDate(date),
        },
        {
            title: "Description",
            dataIndex: "description",
            align: 'center',
            key: "description",
            sorter: (a, b) => a.description?.localeCompare(b.description as string) || 0,
        },
        {
            title: "Amount",
            align: 'center',
            dataIndex: "amount",
            key: "amount",
            render: (amount) => `₹${amount}`,
        },
        {
            title: "Actions",
            align: 'center',
            dataIndex: "action",
            key: "action",
            fixed: 'right',
            width: 100,
            render: (_, record) => (
                <div className='action-container' style={{ justifyContent: 'center' }}>
                    {/*<Image className='view-detail' alt='payment-done' src={editIcon} onClick={() => handleActionClick(record, 'edit_icon')}  height={25} width={25} />*/}
                    <Image className='view-detail' alt='payment-done' src={deleteIcon} onClick={() => handleActionClick(record, 'delete_icon')}  height={25} width={25} />
                </div>
            ),
        },
    ];

    const onChange: DatePickerProps['onChange'] = (_, dateString) => {
        if(dateString) {
            const filtered = data.filter(
                (item) => {
                    const selectedDate = new Date(item.expenseDate as Date).toLocaleDateString("en-GB", {
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

    const handleExportExcel = () => {
        if(!isEmpty(expenses)) {
            const fileName = `Expense_${formatDate(new Date())}`
            const data = sortBy(expenses, 'expenseNumber').map(value => ({
                expenseNumber: String(value.expenseNumber) || '',
                description: value.description || '',
                amount: String(value.amount) || '',
            }))
            exportToExcel(data, fileName);
        }
    }

    return (
        <div className='tokens-table-container'>
            {contextHolder}
            <div className='search-bar-continer' style={{ margin: '16px auto' }}>
                <Input
                    className='search-bar'
                    placeholder="Search by description"
                    value={searchText}
                    suffix={<SearchOutlined />}
                    onChange={(e) => handleSearch(e.target.value)}
                    allowClear
                />

                <DatePicker className='date-picker' onChange={onChange} format={'DD/MM/YYYY'} />

                <Tooltip title='Export Excel' placement='bottom'>
                    <Image className='excel-icon' alt="excel" src={excelIcon} height={40} width={40} onClick={handleExportExcel} />
                </Tooltip>

                <Button className='create-btn' type="primary" icon={<PlusOutlined />} onClick={showModal}>
                    Create Expense
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

                summary={(pageData) => {
                    let totalBorrow = 0;
                    // let totalRepayment = 0;
                    pageData.forEach(({ amount }) => {
                        totalBorrow += amount || 0;
                        // totalRepayment += repayment;
                    });
                    return (
                        <>
                            <Table.Summary.Row className='summery-row' >
                                <Table.Summary.Cell  index={0}>Total</Table.Summary.Cell>
                                <Table.Summary.Cell index={1}/>
                                <Table.Summary.Cell index={2} />
                                <Table.Summary.Cell index={3} align='center'>
                                    <span>₹{totalBorrow}</span>
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        </>
                    );
                }}
            />

            <CreateExpenseModal
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                setEditData={setEditData}
                formData={editData}
            />
        </div>
    );
};

export default ExpensesTable;
