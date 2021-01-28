import React from 'react';
import "./TableView.css";


// Component imports
import {TableType}  from './TableList';
import TableContent from './TableContent';
import TableInfo from './TableInfo';

type TableViewState = {
  currentView: string,
  tableContentData: Array<any>,
  tableAttributeData: {},
  tableInfoData: string,
  selectedTable: string,
  errorMessage: string
}

class TableView extends React.Component<{tableName: string, schemaName: string, tableType: TableType, token: string}, TableViewState> {
  constructor(props: any) {
    super(props);
    this.state = {
      currentView: 'tableContent',
      tableContentData: [],
      tableAttributeData: {},
      tableInfoData: '',
      selectedTable: '',
      errorMessage: ''
    }
  }

  switchCurrentView(viewChoice: string) {
    this.setState({currentView: viewChoice});
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (this.props.tableName !== this.state.selectedTable || this.state.currentView !== prevState.currentView) {
      this.setState({selectedTable: this.props.tableName});
      if (this.state.currentView === 'tableContent') {
        // retrieve table headers
        fetch('/api/get_table_attributes', {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token},
          body: JSON.stringify({schemaName: this.props.schemaName, tableName: this.props.tableName})
        })
          .then(result => {
            console.log('result for table attributes: ', result);
            if (!result.ok) {
              throw Error(`${result.status} - ${result.statusText}`)
            }
            return result.json()})
          .then(result => {
            this.setState({tableAttributeData: result, errorMessage: ''})
          })
          .catch(error => {
            console.log('type of eerrror: ', typeof error)
            console.log(error)
            console.error('problem fetching table attributes');
            console.error(error)
            this.setState({tableAttributeData: {}, errorMessage: 'Problem fetching table attributes'})
          })
        // retrieve table content
        fetch('/api/fetch_tuples', {
          method: 'POST',
          headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token},
          body: JSON.stringify({schemaName: this.props.schemaName, tableName: this.props.tableName})
        })
          .then(result => {
            console.log('result for table content: ', result);
            if (!result.ok) {
              throw Error(`${result.status} - ${result.statusText}`)
            }
            return result.json()})
          .then(result => {
            this.setState({tableContentData: result.tuples, errorMessage: ''})
          })
          .catch(error => {
            console.error('problem fetching table content');
            console.error(error);
            this.setState({tableContentData: [], errorMessage: 'Problem fetching table content'})
          })
      }
      if (this.state.currentView === 'tableInfo') {
        fetch('/api/get_table_definition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.props.token },
          body: JSON.stringify({ schemaName: this.props.schemaName, tableName: this.props.tableName })
        })
          .then(result => {
            console.log('result for table info: ', result);
            if (!result.ok) {
              throw Error(`${result.status} - ${result.statusText}`)
            }
            return result.text()})
          .then(result => {
            this.setState({tableInfoData: result, errorMessage: ''})
          })
          .catch(error => {
            console.error('problem fetching table information: ');
            console.error(error);
            this.setState({tableInfoData: '', errorMessage: 'Problem fetching table information'})
          })
      }
    }
  }

  render() {
    return (
      <div className="table-view">
        <div className="nav-tabs">
          <div className={this.state.currentView === "tableContent" ? "tab inView" : "tab"} onClick={() => this.switchCurrentView('tableContent')}>View Content</div>
          <div className={this.state.currentView === "tableInfo" ? "tab inView" : "tab"} onClick={() => this.switchCurrentView('tableInfo')}>Table Information</div>
        </div>

        <div className="view-area"> {
            this.state.errorMessage ? <div className="errorMessage">{this.state.errorMessage}</div> : 
            this.state.currentView === 'tableContent' ?
            <TableContent contentData={this.state.tableContentData} tableAttributeData={this.state.tableAttributeData} tableName={this.state.selectedTable} tableType={this.props.tableType} />
            : this.state.currentView === 'tableInfo' ?
              <TableInfo infoDefData={this.state.tableInfoData} /> : ''
          }
        </div>
      </div>
    )
  }
}

export default TableView;