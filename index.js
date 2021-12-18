let typingTimer; //timer identifier
let doneTypingInterval = 1000; //1.5 segundos após o fim da digitação
let type = "All"

$(document).ready(() => {
    fetchData("All","");

    $(".dropdown-item").click(function () {
        type = String($(this).attr("value"))
        let search_string = $("#search-input").val()

        $("#dropdownMenuButton").html(type)
        fetchData(type,search_string);

        });

        // DO THE SEARCH WHEN THE USER STOPS TYPING
        $("#search-input").keyup(function () {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(doneTyping, doneTypingInterval);
        });
    
        $("#search-input").keydown(function () {
            clearTimeout(typingTimer);
        });

        //------------------------------------------

        // RETURN DEFAULT RESULTS WHEN INPUT IS CLEARED
        $("#search-input").on("search", function(){
            if($(this).val().length == 0){
                fetchData("All","");
            }
        });
        //------------------------------------------
});

function doneTyping(){
    let search_string = $("#search-input").val()
    fetchData(type,search_string);
}

function fetchData(type, query){
    let urlToGet = ""

    if((type == "All") && (query == "")){
        // SHOW ALL TYPES WITHOUT SEARCHING
        urlToGet = "https://api.allorigins.win/raw?url=https://www.vendus.pt/ws/documents/?api_key=b466e4b7ca33df8e6d372da48f0468ad";
    }

    else{
        if((type != "All") && (query == "")){
            // SHOW ONE TYPE WITHOUT SEARCHING
            let original_url = "https://www.vendus.pt/ws/documents/?api_key=b466e4b7ca33df8e6d372da48f0468ad&type=" + String(type);
            urlToGet = `https://api.allorigins.win/raw?url=${encodeURIComponent(original_url)}`
        }

        else{
            if((type != "All") && (query != "")){
                // SHOW ONE TYPE WITH SEARCHING
                let query_uri = encodeURIComponent(query)
                let original_url = "https://www.vendus.pt/ws/documents/?api_key=b466e4b7ca33df8e6d372da48f0468ad&type=" + String(type) + "&q=" + query_uri;
                urlToGet = `https://api.allorigins.win/raw?url=${encodeURIComponent(original_url)}`
            }

            else{
                if((type == "All") && (query != "")){
                    // SHOW ALL TYPES WITH SEARCHING
                    let query_uri = encodeURIComponent(query)
                    let original_url = "https://www.vendus.pt/ws/documents/?api_key=b466e4b7ca33df8e6d372da48f0468ad&q=" + query;
                    urlToGet = `https://api.allorigins.win/raw?url=${encodeURIComponent(original_url)}`
                }
            }
        }
    }


    $.ajax({
        url: urlToGet,
        type: "get",
        data: {},
    
        success: (data) => {
          console.log(data);

          let invoices_table = ``;
          let invoice_row = ``

          /*TABLE HEADERS*/

          invoices_table = `
          <table class="table table-striped">
            <tbody>
                <tr>
                    <th>ID</th>
                    <th>Number</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                </tr>`;

            /*TABLE ROW, USING FOR EACH FUNCTION*/

            data.forEach((document) => {
                invoice_row = `
                    <tr>
                    <td class="document-id" data-bs-toggle="modal" data-bs-target="#detailsModal">
                    <button class="btn btn-primary" type="button" aria-expanded="false" onclick="changeModal(${document.id})">
                    ${document.id}
                    </button>
                    </td>
                    <td>${document.number}</td>
                    <td>${document.date}</td>
                    <td>${document.type}</td>
                    <td>€${document.amount_gross}</td>
                    <td>${document.status}</td>
                    </tr>`
                
                invoices_table += invoice_row
            });

            invoices_table += invoice_row

            invoices_table += `
                </tbody>
                </table>`

            $("#div_table").html(invoices_table);
        },
        error: (err) => {
            let notFoundMessage = `
            <h3>No results found</h3>
            `
            $("#div_table").html(notFoundMessage);
          console.log(err);
        },
      });
}

function changeModal(invoice_id){

    let detailsUrl = `https://www.vendus.pt/ws/documents/${invoice_id}/?api_key=b466e4b7ca33df8e6d372da48f0468ad`
    let urlToGet = `https://api.allorigins.win/raw?url=${encodeURIComponent(detailsUrl)}`

    $.ajax({
        url: urlToGet,
        type: "get",
        data: {},
    
        success: (data) => {
          console.log(data);
          $("#modal-title").text(`Invoice ID: ${data.id}`);
          $("#pdf-link").attr("href", `https://www.vendus.pt/ws/documents/${invoice_id}.pdf?api_key=b466e4b7ca33df8e6d372da48f0468ad`)
            try{
                let details_table = `
                <table class="table">
                    <tbody>
                        <tr>
                            <th rowspan="2">Client Info:</th>
                            <td>${data.client.name}</td>
                        </tr>
                        <tr>
                            <td>NIF: ${data.client.fiscal_id}</td>
                        </tr>
                        <tr>
                            <th>Itens:</th>
                            <td>${data.items[0].title}</td>
                            <td>x${data.items[0].qty}</td>
                        </tr>
                        <tr>
                            <th rowspan="2">Payments:</th>
                            <td>${data.payments[0].title}</td>
                        </tr>
                        <tr>
                            <td>€${data.payments[0].amount}</td>
                        </tr>
                        <tr>
                            <th> Gross Amount:</th>
                            <td>€${data.amount_gross}</td>
                        </tr>
                        <tr>
                            <th> Net Amount:</th>
                            <td>€${data.amount_net}</td>
                        </tr>

                        `;

                details_table += `
                    </tbody>
                    </table>`

            $("#modal-body").html(details_table);}
          catch(error){
                let errorMessage = `<h3>An error has occurred, try again later.</h3>`
                $("#modal-body").html(errorMessage);
                console.log(error)
          }
        },
        error: (err) => {
            let errorMessage = `
            <h3>An error has occurred, try again later.</h3>
            `
            $("#modal-body").html(errorMessage);
        },
      });
}